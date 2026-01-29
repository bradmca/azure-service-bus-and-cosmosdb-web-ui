"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, Eye, ChevronDown, ChevronRight, MessageSquare, X, FileJson } from "lucide-react";

interface ActiveMessagesViewerProps {
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

export default function ActiveMessagesViewer({ topic, subscription, searchQuery = "" }: ActiveMessagesViewerProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

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
            console.log("Fetching active messages from:", `/api/messages?${params.toString()}`);
            const res = await fetch(`/api/messages?${params.toString()}`);
            const data = await res.json();
            console.log("Active messages response:", data);
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
            console.error("Failed to fetch active messages", err);
            setError("Failed to fetch active messages");
        } finally {
            setLoading(false);
        }
    }, [topic, subscription]);

    useEffect(() => {
        if (isExpanded) {
            fetchMessages();
        }
    }, [fetchMessages, isExpanded]);

    return (
        <div className="card">
            {/* Collapsible Header */}
            <div 
                className="card-header cursor-pointer hover:bg-[#10263b] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                    <MessageSquare className="w-5 h-5" />
                    <span>Active Messages</span>
                    {isExpanded && (
                        <span className="ml-2 px-2 py-0.5 bg-[rgba(255,255,255,0.2)] rounded text-xs font-medium">
                            {searchQuery ? `${filteredMessages.length} / ${messages.length}` : messages.length}
                        </span>
                    )}
                </div>
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); fetchMessages(); }}
                        className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-full transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                )}
            </div>

            {/* Expandable Content */}
            {isExpanded && (
                <div className="table-container animate-slideIn">
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
                                    <td colSpan={4} className="px-4 py-8 text-center text-[#e30613]">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center">
                                        {loading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-[#002147] mx-auto" />
                                        ) : searchQuery ? (
                                            <p className="text-[#666666]">No messages matching &quot;{searchQuery}&quot;</p>
                                        ) : (
                                            <p className="text-[#666666]">No active messages</p>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.messageId + msg.sequenceNumber} className="hover:bg-[#f5f5f5]">
                                        <td className="font-mono text-xs">{msg.messageId}</td>
                                        <td>{formatUKDate(msg.enqueuedTimeUtc)}</td>
                                        <td>{msg.subject || <span className="text-[#666666]">—</span>}</td>
                                        <td className="text-right">
                                            <button
                                                onClick={() => setSelectedMessage(msg)}
                                                className="btn-secondary py-1 px-3 text-xs"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
                                <label className="label">Message ID</label>
                                <div className="code-block">
                                    {selectedMessage.messageId}
                                </div>
                            </div>
                            <div>
                                <label className="label">Sequence Number</label>
                                <div className="code-block">
                                    {selectedMessage.sequenceNumber}
                                </div>
                            </div>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
