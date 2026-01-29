"use client";

import { BookOpen, Shield, Layers, AlertTriangle, Send, Database, Search, ChevronRight } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";

export default function InstructionsPage() {
    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
                {/* Page Header */}
                <div className="bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#002147] rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#002147]">User Guide</h1>
                            <p className="text-[#666666]">
                                Learn how to use the Azure Service Bus Manager effectively
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guide Content */}
                <div className="card">
                    <div className="card-body space-y-8">
                        {/* Authentication Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-[#002147]">Authentication</h2>
                            </div>
                            <p className="text-[#333333] leading-relaxed">
                                The application is secured with a login system. Use your credentials to access the dashboard.
                                The default username is <code className="bg-[#f5f5f5] px-2 py-0.5 rounded text-[#e30613] font-mono text-sm">admin</code>. 
                                Please check <code className="bg-[#f5f5f5] px-2 py-0.5 rounded text-[#002147] font-mono text-sm">src/auth.ts</code> for the password.
                            </p>
                        </section>

                        <hr className="border-[#e0e0e0]" />

                        {/* Topics & Subscriptions Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Layers className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-[#002147]">Managing Topics & Subscriptions</h2>
                            </div>
                            <p className="text-[#333333] leading-relaxed mb-4">
                                The Dashboard lists all available topics in your Service Bus namespace.
                                Click on a topic to expand and view its subscriptions. Click on a subscription name to view its details, including:
                            </p>
                            <ul className="space-y-2 ml-6">
                                {["Active Message Count", "Dead Letter Message Count", "Last Updated Timestamp"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[#333333]">
                                        <ChevronRight className="w-4 h-4 text-[#e30613]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0] mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Search className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-[#002147]">Search Topics & Subscriptions</h3>
                                </div>
                                <p className="text-[#333333] mb-3">Use the search box on the Dashboard to quickly find topics and subscriptions:</p>
                                <ul className="space-y-2 ml-6">
                                    {[
                                        "Type in the search box to filter topics and subscriptions in real-time.",
                                        "Searches match both topic names and subscription names.",
                                        "Matching topics will automatically expand to show their subscriptions.",
                                        "Click the X button or clear the search to show all topics again."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[#333333]">
                                            <ChevronRight className="w-4 h-4 text-[#e30613]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <hr className="border-[#e0e0e0]" />

                        {/* DLQ Management Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-[#e30613]" />
                                </div>
                                <h2 className="text-xl font-bold text-[#002147]">Dead Letter Queue (DLQ) Management</h2>
                            </div>
                            <p className="text-[#333333] leading-relaxed mb-4">
                                If a subscription has messages in its Dead Letter Queue, they will be visible in the "Dead Letter Messages" section of the subscription detail page.
                            </p>

                            <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Send className="w-5 h-5 text-green-600" />
                                    <h3 className="text-lg font-semibold text-[#002147]">Reprocessing Messages</h3>
                                </div>
                                <p className="text-[#333333] mb-3">To reprocess a message:</p>
                                <ol className="space-y-2 ml-6">
                                    {[
                                        "Locate the message in the DLQ list.",
                                        "Click the Resubmit button.",
                                        "Confirm the action."
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3 text-[#333333]">
                                            <span className="shrink-0 w-6 h-6 bg-[#002147] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                {i + 1}
                                            </span>
                                            {step}
                                        </li>
                                    ))}
                                </ol>
                                <p className="text-[#666666] text-sm mt-4 italic">
                                    Note: The original message in the DLQ is not automatically deleted in this version to prevent data loss.
                                </p>
                            </div>

                            <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0] mt-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Search className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-[#002147]">Search Messages</h3>
                                </div>
                                <p className="text-[#333333] mb-3">
                                    On the subscription detail page, use the search box to filter messages across both the Dead Letter Queue and Active Messages:
                                </p>
                                <ul className="space-y-2 ml-6">
                                    {[
                                        "Search by Message ID, Subject, Body content, or Application Properties.",
                                        "Results are filtered in real-time as you type.",
                                        "The count shows filtered results (e.g., \"5 / 20\" means 5 matches out of 20 total).",
                                        "All dates are displayed in UK format (DD/MM/YYYY, HH:mm:ss).",
                                        "Messages are sorted by enqueued time with the most recent at the top."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[#333333]">
                                            <ChevronRight className="w-4 h-4 text-[#e30613]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        <hr className="border-[#e0e0e0]" />

                        {/* Cosmos DB Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Database className="w-5 h-5 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-[#002147]">Cosmos DB Explorer</h2>
                            </div>
                            <p className="text-[#333333] leading-relaxed mb-6">
                                Access the Cosmos DB Explorer from the navigation bar to browse databases, containers, and documents.
                            </p>

                            <div className="space-y-4">
                                {/* Browsing Card */}
                                <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0]">
                                    <h3 className="text-lg font-semibold text-[#002147] mb-3">Browsing Databases & Containers</h3>
                                    <ol className="space-y-2 ml-6">
                                        {[
                                            "Click Cosmos DB in the navigation bar.",
                                            "The page displays all databases in the connected Cosmos DB account.",
                                            "Click on a database to expand and view its containers.",
                                            "Click on a container to browse its items."
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[#333333]">
                                                <span className="shrink-0 w-6 h-6 bg-[#002147] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                    {i + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Searching Card */}
                                <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Search className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-[#002147]">Searching Items</h3>
                                    </div>
                                    <p className="text-[#333333] mb-3">Within a container, you can search for items:</p>
                                    <ol className="space-y-2 ml-6">
                                        {[
                                            "Select a field from the dropdown (e.g., id, name).",
                                            "Enter a search value in the text box.",
                                            "Click Search to find matching items.",
                                            "The search uses case-insensitive partial matching."
                                        ].map((step, i) => (
                                            <li key={i} className="flex items-start gap-3 text-[#333333]">
                                                <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                    {i + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Viewing Details Card */}
                                <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e0e0e0]">
                                    <h3 className="text-lg font-semibold text-[#002147] mb-3">Viewing Item Details</h3>
                                    <p className="text-[#333333]">
                                        Click the <span className="font-semibold">View</span> button on any item to see its full JSON document in a modal dialog.
                                        The modal displays the document ID and the complete document structure with proper formatting.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
