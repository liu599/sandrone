"use client";

import { useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Loader2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invertSearch } from "@/service/knowledgeBase";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface SearchResult {
  doc_id: string;
  score: number;
  summary: string;
}

function DocIdCell({ docId }: { docId: string }) {
  const [copied, setCopied] = useState(false);
  const truncatedId = docId.length > 20 ? docId.substring(0, 20) + "..." : docId;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(docId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex items-center gap-2 group">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-xs text-gray-900 font-medium cursor-pointer underline decoration-dotted decoration-gray-300 underline-offset-2">
            {truncatedId}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-all">
          {docId}
        </TooltipContent>
      </Tooltip>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
      </Button>
    </div>
  );
}

function SummaryCell({ summary }: { summary: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isLong = summary.length > 300;

  if (!isLong) {
    return (
      <div
        className="text-sm text-gray-600 leading-relaxed break-words"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="relative">
        <div
          className={`text-sm text-gray-600 leading-relaxed break-words transition-all duration-200 ${!isOpen ? "max-h-24 overflow-hidden" : ""}`}
          dangerouslySetInnerHTML={{ __html: summary }}
        />
        {!isOpen && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs cursor-pointer">
          {isOpen ? (
            <><ChevronUp className="w-3 h-3 mr-1" /> Show Less</>
          ) : (
            <><ChevronDown className="w-3 h-3 mr-1" /> Show More</>
          )}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

function KnowledgeBaseDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const kbId = params.id as string;
  const kbUuid = searchParams.get("uuid") || "";
  const kbName = searchParams.get("name") || "";

  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res: any = await invertSearch({
        indexing_id: kbId,
        query: query,
        top_k: topK,
      });

      if (res && (res.code === 20000 || res.code === 0)) {
          const data = res.data?.results || res.data || [];
          setResults(Array.isArray(data) ? data : []);
      } else if (Array.isArray(res)) {
          setResults(res);
      } else {
          setResults([]);
      }
    } catch (error) {
      console.error("Failed to search knowledge base:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{kbName || "Knowledge Base Search"}</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 ml-14">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-700">ID:</span> {kbId}
        </div>
        {kbUuid && (
          <div className="flex items-center gap-1 border-l pl-4 border-gray-200">
            <span className="font-semibold text-gray-700">UUID:</span> {kbUuid}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Enter search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Top K:</span>
            <input
              type="range"
              min="5"
              max="20"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-32 cursor-pointer"
            />
            <span className="text-sm font-medium w-6">{topK}</span>
          </div>
          <Button type="submit" disabled={loading || !query.trim()} className="cursor-pointer">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Search
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-4 text-sm font-semibold text-gray-600 w-44">Doc ID</th>
                <th className="px-4 py-4 text-sm font-semibold text-gray-600 w-24">Score</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Summary</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                      <p className="text-gray-500">Searching...</p>
                    </div>
                  </td>
                </tr>
              ) : results.length > 0 ? (
                results.map((result, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors align-top">
                    <td className="px-4 py-4">
                      <DocIdCell docId={result.doc_id} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">
                        {result.score.toFixed(4)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <SummaryCell summary={result.summary} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    {hasSearched ? (
                      "No results found for this query."
                    ) : (
                      "Enter a query above to search the knowledge base."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBaseDetailPage() {
  return (
    <TooltipProvider>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      }>
        <KnowledgeBaseDetailContent />
      </Suspense>
    </TooltipProvider>
  );
}
