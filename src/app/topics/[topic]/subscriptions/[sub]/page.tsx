"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, AlertTriangle, Clock, Activity, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import DLQViewer from "@/components/DLQViewer";
import ActiveMessagesViewer from "@/components/ActiveMessagesViewer";

interface SubscriptionDetails {
    subscriptionName: string;
    topicName: string;
    activeMessageCount: number;
    deadLetterMessageCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function SubscriptionPage({ params }: { params: Promise<{ topic: string; sub: string }> }) {
    const { topic, sub } = use(params);
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchSubscription = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/topics/${topic}/subscriptions/${sub}`);
            if (!res.ok) {
                console.error(`API error: ${res.status} ${res.statusText}`);
                setSubscription(null);
                setLoading(false);
                return;
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.error("API returned non-JSON response");
                setSubscription(null);
                setLoading(false);
                return;
            }
            const data = await res.json();
            console.log("Subscription data:", data);
            setSubscription(data);
        } catch (err) {
            console.error("Error fetching subscription:", err);
            setSubscription(null);
        } finally {
            setLoading(false);
        }
    }, [topic, sub]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#002147] mx-auto mb-4" />
                    <p className="text-[#666666]">Loading subscription details...</p>
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="text-center p-12">
                <AlertTriangle className="w-12 h-12 text-[#e30613] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#002147] mb-2">Subscription not found</h2>
                <p className="text-[#666666] mb-6">The subscription you're looking for doesn't exist.</p>
                <Link href="/" className="btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Breadcrumb & Header */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
                <div className="flex items-start gap-4">
                    <Link 
                        href="/" 
                        className="p-2 rounded-lg border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#002147]" />
                    </Link>
                    <div className="flex-1">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
                            <Layers className="w-4 h-4" />
                            <span>{topic}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-[#002147] font-medium">{subscription.subscriptionName}</span>
                        </div>
                        {/* Title */}
                        <h1 className="text-2xl font-bold text-[#002147]">
                            {subscription.subscriptionName}
                        </h1>
                    </div>
                    <button
                        onClick={fetchSubscription}
                        className="btn-secondary py-2 px-4"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide mb-1">
                                Active Messages
                            </p>
                            <p className="text-4xl font-bold text-[#002147] font-mono">
                                {subscription.activeMessageCount.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide mb-1">
                                Dead Letter Messages
                            </p>
                            <p className={`text-4xl font-bold font-mono ${
                                subscription.deadLetterMessageCount > 0 
                                    ? "text-[#e30613]" 
                                    : "text-[#002147]"
                            }`}>
                                {subscription.deadLetterMessageCount.toLocaleString()}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            subscription.deadLetterMessageCount > 0 
                                ? "bg-red-100" 
                                : "bg-green-100"
                        }`}>
                            <AlertTriangle className={`w-6 h-6 ${
                                subscription.deadLetterMessageCount > 0 
                                    ? "text-[#e30613]" 
                                    : "text-green-600"
                            }`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide mb-1">
                                Last Updated
                            </p>
                            <p className="text-lg font-medium text-[#002147]">
                                {subscription.updatedAt 
                                    ? new Date(subscription.updatedAt).toLocaleString() 
                                    : 'N/A'
                                }
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                    <input
                        type="text"
                        placeholder="Search messages by ID, subject, or body content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-[#e0e0e0] rounded-lg bg-[#f5f5f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e0e0e0] rounded-full transition-colors"
                            title="Clear search"
                        >
                            <X className="w-4 h-4 text-[#666666]" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-xs text-[#666666] mt-2">
                        Filtering messages containing &quot;{searchQuery}&quot; in both DLQ and Active Messages
                    </p>
                )}
            </div>

            {/* DLQ Viewer */}
            <DLQViewer topic={topic} subscription={subscription.subscriptionName} searchQuery={searchQuery} />
            
            {/* Active Messages Viewer */}
            <ActiveMessagesViewer topic={topic} subscription={subscription.subscriptionName} searchQuery={searchQuery} />
        </div>
    );
}
