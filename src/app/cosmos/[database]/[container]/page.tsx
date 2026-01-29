"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Folder, Search, RefreshCw, ChevronRight, Eye, Filter, X, FileJson, Loader2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

interface ItemsResponse {
    items: Record<string, unknown>[];
    continuationToken?: string;
    hasMore: boolean;
    error?: string;
}

export default function ContainerPage({ params }: { params: Promise<{ database: string; container: string }> }) {
    const { database, container } = use(params);
    const [items, setItems] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [continuationToken, setContinuationToken] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
    
    // Search/Filter state
    const [searchField, setSearchField] = useState("id");
    const [searchValue, setSearchValue] = useState("");
    const [customQuery, setCustomQuery] = useState("");
    const [showQueryInput, setShowQueryInput] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const fetchItems = useCallback(async (token?: string | null, reset: boolean = false) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (token && !reset) {
                params.append("continuationToken", token);
            }
            if (customQuery) {
                params.append("query", customQuery);
            }

            const res = await fetch(
                `/api/cosmos/databases/${encodeURIComponent(database)}/containers/${encodeURIComponent(container)}/items?${params.toString()}`
            );
            const data: ItemsResponse = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (reset) {
                setItems(data.items);
            } else if (token) {
                setItems(prev => [...prev, ...data.items]);
            } else {
                setItems(data.items);
            }
            
            setContinuationToken(data.continuationToken || null);
            setHasMore(data.hasMore);
        } catch (err) {
            console.error("Error fetching items:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [database, container, customQuery]);

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            fetchItems(null, true);
            return;
        }

        setIsSearching(true);
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                searchField,
                searchValue: searchValue.trim()
            });

            const res = await fetch(
                `/api/cosmos/databases/${encodeURIComponent(database)}/containers/${encodeURIComponent(container)}/items?${params.toString()}`
            );
            const data: ItemsResponse = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setItems(data.items);
            setContinuationToken(null);
            setHasMore(false);
        } catch (err) {
            console.error("Error searching items:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCustomQuery = async () => {
        setIsSearching(true);
        fetchItems(null, true);
    };

    const clearSearch = () => {
        setSearchValue("");
        setCustomQuery("");
        setIsSearching(false);
        setShowQueryInput(false);
        fetchItems(null, true);
    };

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const loadMore = () => {
        if (continuationToken && hasMore) {
            fetchItems(continuationToken);
        }
    };

    // Get all unique keys from items for field selection
    const availableFields = items.length > 0
        ? [...new Set(items.flatMap(item => Object.keys(item)))]
        : ["id"];

    return (
        <AuthGuard>
            <div className="space-y-6 animate-fadeIn">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
                    <div className="flex items-start gap-4">
                        <Link 
                            href="/cosmos" 
                            className="p-2 rounded-lg border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[#002147]" />
                        </Link>
                        <div className="flex-1">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-[#666666] mb-2">
                                <Database className="w-4 h-4 text-green-600" />
                                <span>{decodeURIComponent(database)}</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-[#002147] font-medium">{decodeURIComponent(container)}</span>
                            </div>
                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <Folder className="w-8 h-8 text-yellow-500" />
                                <h1 className="text-2xl font-bold text-[#002147]">
                                    {decodeURIComponent(container)}
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6 space-y-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Field Search */}
                        <div className="flex-1 min-w-[300px]">
                            <label className="label">Search by Field</label>
                            <div className="flex gap-2">
                                <select
                                    value={searchField}
                                    onChange={(e) => setSearchField(e.target.value)}
                                    className="input max-w-[150px]"
                                >
                                    {availableFields.map(field => (
                                        <option key={field} value={field}>{field}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    placeholder="Search value..."
                                    className="input flex-1"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="btn-primary bg-green-600 hover:bg-green-700"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowQueryInput(!showQueryInput)}
                                className={`btn-secondary ${showQueryInput ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700" : ""}`}
                            >
                                <Filter className="w-4 h-4" />
                                Custom Query
                            </button>
                            {isSearching && (
                                <button
                                    onClick={clearSearch}
                                    className="btn-secondary"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => fetchItems(null, true)}
                                className="btn-secondary"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Custom Query Input */}
                    {showQueryInput && (
                        <div className="pt-4 border-t border-[#e0e0e0] animate-slideIn">
                            <label className="label">SQL Query</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customQuery}
                                    onChange={(e) => setCustomQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCustomQuery()}
                                    placeholder="SELECT * FROM c WHERE c.status = 'active'"
                                    className="input flex-1 font-mono text-sm"
                                />
                                <button
                                    onClick={handleCustomQuery}
                                    className="btn-primary bg-purple-600 hover:bg-purple-700"
                                >
                                    Execute
                                </button>
                            </div>
                            <p className="text-xs text-[#666666] mt-2">
                                Use SQL-like syntax. Example: SELECT * FROM c WHERE c.type = &quot;order&quot; AND c.amount &gt; 100
                            </p>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="card">
                    <div className="card-header">
                        <div className="flex items-center gap-2">
                            <FileJson className="w-5 h-5" />
                            <span>Items</span>
                            <span className="ml-2 px-2 py-0.5 bg-[rgba(255,255,255,0.2)] rounded text-xs font-medium">
                                {items.length}{hasMore ? "+" : ""}
                            </span>
                        </div>
                    </div>

                    {error ? (
                        <div className="p-8 text-center">
                            <X className="w-12 h-12 text-[#e30613] mx-auto mb-3" />
                            <p className="text-[#e30613] font-medium">Error: {error}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            {loading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-[#002147] mx-auto" />
                            ) : (
                                <>
                                    <FileJson className="w-12 h-12 text-[#e0e0e0] mx-auto mb-3" />
                                    <p className="text-[#666666]">No items found</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Preview</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={item.id || index} className="hover:bg-[#f5f5f5]">
                                                <td className="font-mono text-xs text-green-600">
                                                    {item.id || `Item ${index}`}
                                                </td>
                                                <td className="max-w-md">
                                                    <div className="truncate text-xs text-[#666666]">
                                                        {JSON.stringify(item).substring(0, 100)}...
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => setSelectedItem(item)}
                                                        className="btn-secondary py-1 px-3 text-xs"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Load More */}
                            {hasMore && (
                                <div className="p-4 border-t border-[#e0e0e0] flex justify-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="btn-primary"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                        Load More
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Item Detail Modal */}
                {selectedItem && (
                    <div className="modal-overlay animate-fadeIn" onClick={() => setSelectedItem(null)}>
                        <div className="modal max-w-4xl animate-slideIn" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="flex items-center gap-2">
                                    <FileJson className="w-5 h-5 text-[#002147]" />
                                    <h3 className="text-lg font-bold text-[#002147]">Item Details</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-1 hover:bg-[#f5f5f5] rounded transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#666666]" />
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* Document ID Header */}
                                <div className="mb-4">
                                    <label className="label">Document ID</label>
                                    <div className="bg-green-50 border border-green-200 p-3 rounded text-sm font-mono text-green-700">
                                        {selectedItem.id}
                                    </div>
                                </div>
                                
                                {/* Properties Table */}
                                <div>
                                    <label className="label">Document Properties</label>
                                    <div className="border border-[#e0e0e0] rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#002147] text-white sticky top-0">
                                                <tr>
                                                    <th className="text-left px-4 py-2 font-semibold w-1/3">Property</th>
                                                    <th className="text-left px-4 py-2 font-semibold">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#e0e0e0]">
                                                {Object.entries(selectedItem)
                                                    .filter(([key]) => !key.startsWith('_')) // Hide internal Cosmos fields first
                                                    .sort(([a], [b]) => a.localeCompare(b))
                                                    .map(([key, value]) => (
                                                        <tr key={key} className="hover:bg-[#f5f5f5]">
                                                            <td className="px-4 py-2 font-medium text-[#002147] align-top">
                                                                {key}
                                                            </td>
                                                            <td className="px-4 py-2 text-[#333333]">
                                                                {typeof value === 'object' && value !== null ? (
                                                                    <pre className="text-xs bg-[#f5f5f5] p-2 rounded overflow-x-auto">
                                                                        {JSON.stringify(value, null, 2)}
                                                                    </pre>
                                                                ) : typeof value === 'boolean' ? (
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                        {value.toString()}
                                                                    </span>
                                                                ) : value === null ? (
                                                                    <span className="text-[#666666] italic">null</span>
                                                                ) : (
                                                                    <span className="break-all">{String(value)}</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                {/* Internal Cosmos fields (collapsed by default) */}
                                                {Object.entries(selectedItem)
                                                    .filter(([key]) => key.startsWith('_'))
                                                    .length > 0 && (
                                                    <>
                                                        <tr className="bg-[#f5f5f5]">
                                                            <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-[#666666] uppercase">
                                                                System Properties
                                                            </td>
                                                        </tr>
                                                        {Object.entries(selectedItem)
                                                            .filter(([key]) => key.startsWith('_'))
                                                            .map(([key, value]) => (
                                                                <tr key={key} className="hover:bg-[#f5f5f5] text-xs">
                                                                    <td className="px-4 py-2 font-medium text-[#666666] align-top">
                                                                        {key}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-[#666666] font-mono break-all">
                                                                        {String(value)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="btn-secondary"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
