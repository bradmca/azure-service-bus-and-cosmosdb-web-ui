"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Eye, Send, AlertTriangle, X, FileJson } from "lucide-react";

interface DLQViewerProps {
    topic: string;
    subscription: string;
    searchQuery?: string;
}

interface Message {
    messageId: string;
    body: any;
    sequenceNumber: string;
    enqueuedTimeUtc: string;
    subject?: string;
    applicationProperties?: Record<string, any>;
}

// Format date in UK format (DD/MM/YYYY HH:mm:ss)
const formatUKDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

export default function DLQViewer({ topic, subscription, searchQuery = "" }: DLQViewerProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [resubmitting, setResubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter messages based on search query
    const getFilteredMessages = () => {
        if (!searchQuery.trim()) {
            return messages;
        }
        
        const query = searchQuery.toLowerCase().trim();
        
        return messages.filter(msg => {
            // Search in messageId
            if (msg.messageId?.toLowerCase().includes(query)) return true;
            // Search in subject
            if (msg.subject?.toLowerCase().includes(query)) return true;
            // Search in body (convert to string for searching)
            const bodyStr = typeof msg.body === 'string' 
                ? msg.body 
                : JSON.stringify(msg.body);
            if (bodyStr?.toLowerCase().includes(query)) return true;
            // Search in application properties
            const propsStr = JSON.stringify(msg.applicationProperties || {});
            if (propsStr?.toLowerCase().includes(query)) return true;
            
            return false;
        });
    };

    const filteredMessages = getFilteredMessages();

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.append("topic", topic);
        params.append("subscription", subscription);

        try {
            console.log("Fetching DLQ from:", `/api/dlq?${params.toString()}`);
            const res = await fetch(`/api/dlq?${params.toString()}`);
            const data = await res.json();
            console.log("DLQ response:", data);
            if (data.error) {
                setError(data.error);
                setMessages([]);
            } else if (Array.isArray(data)) {
                // Sort messages by enqueued time, most recent first
                const sortedMessages = data.sort((a: Message, b: Message) => 
                    new Date(b.enqueuedTimeUtc).getTime() - new Date(a.enqueuedTimeUtc).getTime()
                );
                setMessages(sortedMessages);
            }
        } catch (err) {
            console.error("Failed to fetch DLQ messages", err);
            setError("Failed to fetch DLQ messages");
        } finally {
            setLoading(false);
        }
    }, [topic, subscription]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleResubmit = async (message: Message) => {
        if (!confirm("Are you sure you want to resubmit this message? It will be sent to the topic.")) return;

        setResubmitting(true);
        try {
            const res = await fetch("/api/dlq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    topic,
                    subscription,
                    message
                }),
            });

            if (res.ok) {
                alert("Message resubmitted successfully!");
                fetchMessages();
            } else {
                alert("Failed to resubmit message.");
            }
        } catch (error) {
            console.error("Error resubmitting:", error);
            alert("Error resubmitting message.");
        } finally {
            setResubmitting(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#e30613]" />
                    <span>Dead Letter Queue</span>
                    <span className="ml-2 px-2 py-0.5 bg-[rgba(255,255,255,0.2)] rounded text-xs font-medium">
                        {searchQuery ? `${filteredMessages.length} / ${messages.length}` : messages.length}
                    </span>
                </div>
                <button
                    onClick={fetchMessages}
                    className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Message ID</th>
                            <th>Enqueued Time</th>
                            <th>Subject</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {error ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center">
                                    <AlertTriangle className="w-8 h-8 text-[#e30613] mx-auto mb-2" />
                                    <p className="text-[#e30613] font-medium">Error: {error}</p>
                                </td>
                            </tr>
                        ) : filteredMessages.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center">
                                    {loading ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-[#002147] mx-auto" />
                                    ) : searchQuery ? (
                                        <>
                                            <p className="text-[#666666]">No messages matching &quot;{searchQuery}&quot;</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-[#666666]">No messages in Dead Letter Queue</p>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            filteredMessages.map((msg) => (
                                <tr key={msg.messageId} className="hover:bg-[#f5f5f5]">
                                    <td className="font-mono text-xs">{msg.messageId}</td>
                                    <td>{formatUKDate(msg.enqueuedTimeUtc)}</td>
                                    <td>{msg.subject || <span className="text-[#666666]">—</span>}</td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedMessage(msg)}
                                                className="btn-secondary py-1 px-3 text-xs"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleResubmit(msg)}
                                                disabled={resubmitting}
                                                className="btn-primary py-1 px-3 text-xs bg-[#28a745] hover:bg-[#218838]"
                                            >
                                                <Send className="w-3 h-3" />
                                                Resubmit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Message Details Modal */}
            {selectedMessage && (
                <div className="modal-overlay animate-fadeIn" onClick={() => setSelectedMessage(null)}>
                    <div className="modal animate-slideIn" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="flex items-center gap-2">
                                <FileJson className="w-5 h-5 text-[#002147]" />
                                <h3 className="text-lg font-bold text-[#002147]">Message Details</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedMessage(null)} 
                                className="p-1 hover:bg-[#f5f5f5] rounded transition-colors"
                            >
                                <X className="w-5 h-5 text-[#666666]" />
                            </button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="label">Body</label>
                                <pre className="code-block">
                                    {JSON.stringify(selectedMessage.body, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <label className="label">Application Properties</label>
                                <pre className="code-block">
                                    {JSON.stringify(selectedMessage.applicationProperties, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleResubmit(selectedMessage)}
                                disabled={resubmitting}
                                className="btn-primary bg-[#28a745] hover:bg-[#218838]"
                            >
                                <Send className="w-4 h-4" />
                                Resubmit Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
