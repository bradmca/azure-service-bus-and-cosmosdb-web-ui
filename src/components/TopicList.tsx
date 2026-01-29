"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Layers, AlertTriangle, ChevronRight, MessageSquare, RefreshCw, Search, X } from "lucide-react";

interface Subscription {
    subscriptionName: string;
    activeMessageCount: number;
    deadLetterMessageCount: number;
}

interface Topic {
    name: string;
    subscriptions: Subscription[];
}

export default function TopicList() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Filter topics and subscriptions based on search query
    const getFilteredTopics = () => {
        if (!searchQuery.trim()) {
            return topics;
        }
        
        const query = searchQuery.toLowerCase().trim();
        
        return topics
            .map(topic => {
                // Check if topic name matches
                const topicMatches = topic.name.toLowerCase().includes(query);
                
                // Filter subscriptions that match
                const matchingSubscriptions = topic.subscriptions.filter(sub =>
                    sub.subscriptionName.toLowerCase().includes(query)
                );
                
                // Include topic if name matches OR any subscription matches
                if (topicMatches || matchingSubscriptions.length > 0) {
                    return {
                        ...topic,
                        // If searching, show all subs if topic matches, or just matching subs
                        subscriptions: topicMatches ? topic.subscriptions : matchingSubscriptions
                    };
                }
                return null;
            })
            .filter((topic): topic is Topic => topic !== null);
    };

    const filteredTopics = getFilteredTopics();

    // Auto-expand topics when searching
    const isTopicExpanded = (topicName: string) => {
        if (searchQuery.trim()) {
            return true; // Always expand when searching
        }
        return expandedTopics.has(topicName);
    };

    const fetchTopics = () => {
        setLoading(true);
        fetch("/api/topics")
            .then(async (res) => {
                if (res.status === 401) {
                    throw new Error("Unauthorized");
                }
                const text = await res.text();
                try {
                    return JSON.parse(text);
                } catch (_e) {
                    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
                }
            })
            .then((data) => {
                if (data.error) {
                    throw new Error(data.error);
                }
                if (Array.isArray(data)) {
                    setTopics(data);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("TopicList Error:", err);
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const toggleTopic = (topicName: string) => {
        setExpandedTopics(prev => {
            const newSet = new Set(prev);
            if (newSet.has(topicName)) {
                newSet.delete(topicName);
            } else {
                newSet.add(topicName);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5" />
                        <span>Topics</span>
                    </div>
                </div>
                <div className="flex justify-center items-center p-12">
                    <Loader2 className="animate-spin text-[#e30613] w-8 h-8" />
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    <span>Topics</span>
                    <span className="ml-2 px-2 py-0.5 bg-[rgba(255,255,255,0.2)] rounded text-xs font-medium">
                        {topics.length}
                    </span>
                </div>
                <button
                    onClick={fetchTopics}
                    className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>
            
            {/* Search Box */}
            <div className="p-4 bg-[#f5f5f5] border-b border-[#e0e0e0]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                        type="text"
                        placeholder="Search topics and subscriptions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#002147] focus:border-transparent text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e0e0e0] rounded-full transition-colors"
                            title="Clear search"
                        >
                            <X className="w-4 h-4 text-[#666666]" />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-xs text-[#666666] mt-2">
                        Found {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} with {filteredTopics.reduce((acc, t) => acc + t.subscriptions.length, 0)} subscription{filteredTopics.reduce((acc, t) => acc + t.subscriptions.length, 0) !== 1 ? 's' : ''} matching &quot;{searchQuery}&quot;
                    </p>
                )}
            </div>
            
            <div className="divide-y divide-[#e0e0e0]">
                {error ? (
                    <div className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-[#e30613] mx-auto mb-3" />
                        <p className="text-[#e30613] font-medium">Error loading topics</p>
                        <p className="text-[#666666] text-sm mt-1">{error}</p>
                        <button onClick={fetchTopics} className="btn-primary mt-4">
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                ) : filteredTopics.length === 0 ? (
                    <div className="p-12 text-center">
                        <Layers className="w-12 h-12 text-[#e0e0e0] mx-auto mb-3" />
                        <p className="text-[#666666]">
                            {searchQuery ? `No results found for "${searchQuery}"` : "No topics found"}
                        </p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="btn-secondary mt-4"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTopics.map((topic) => (
                        <div key={topic.name} className="animate-fadeIn">
                            {/* Topic Header */}
                            <div 
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                                onClick={() => toggleTopic(topic.name)}
                            >
                                <div className="flex items-center gap-3">
                                    <ChevronRight 
                                        className={`w-5 h-5 text-[#666666] transition-transform ${
                                            isTopicExpanded(topic.name) ? "rotate-90" : ""
                                        }`} 
                                    />
                                    <div className="w-10 h-10 bg-[#002147] rounded-lg flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#002147]">{topic.name}</h3>
                                        <p className="text-sm text-[#666666]">
                                            {topic.subscriptions.length} subscription{topic.subscriptions.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {topic.subscriptions.some(s => s.deadLetterMessageCount > 0) && (
                                        <span className="stat-badge stat-badge-danger">
                                            <AlertTriangle className="w-3 h-3" />
                                            DLQ Messages
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Subscriptions List */}
                            {isTopicExpanded(topic.name) && (
                                <div className="bg-[#f5f5f5] border-t border-[#e0e0e0]">
                                    <div className="divide-y divide-[#e0e0e0]">
                                        {topic.subscriptions.map((sub) => (
                                            <Link
                                                key={sub.subscriptionName}
                                                href={`/topics/${topic.name}/subscriptions/${sub.subscriptionName}`}
                                                className="flex items-center justify-between p-4 pl-16 hover:bg-white transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <MessageSquare className="w-4 h-4 text-[#666666] group-hover:text-[#002147]" />
                                                    <span className="text-[#333333] group-hover:text-[#002147] font-medium">
                                                        {sub.subscriptionName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="stat-badge stat-badge-primary">
                                                        <span className="font-mono">{sub.activeMessageCount}</span>
                                                        Active
                                                    </span>
                                                    <span className={`stat-badge ${sub.deadLetterMessageCount > 0 ? "stat-badge-danger" : "stat-badge-success"}`}>
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span className="font-mono">{sub.deadLetterMessageCount}</span>
                                                        DLQ
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-[#002147]" />
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
