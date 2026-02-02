"use strict";
"use client";

import { useEffect, useState } from "react";
import { searchKnowledgeBase } from "@/service/knowledgeBase";
import { FileText, Loader2, ChevronLeft } from "lucide-react";
import { CreateKBDialog } from "./CreateKBDialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface KnowledgeBaseItem {
  uuid: string;
  meta?: {
    name?: string;
    doc_ids?: string[];
  };
}

export default function KnowledgeBasePage() {
  const [list, setList] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchList = async () => {
    console.log("Fetching knowledge base list...");
    setLoading(true);
    try {
      const res: any = await searchKnowledgeBase({
        sourceType: "indexing",
        filter: {},
        current: 1,
        pageSize: 20,
      });
      console.log("Search response:", res);
      if (res && (res.code === 20000 || res.code === 0)) {
          const data = res.data?.list || res.data || [];
          setList(Array.isArray(data) ? data : []);
      } else if (Array.isArray(res)) {
          setList(res);
      }
    } catch (error) {
      console.error("Failed to fetch knowledge base:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Upload Card */}
        <CreateKBDialog onSuccess={fetchList} />

        {/* List Items */}
        {loading ? (
            <div className="col-span-full flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        ) : (
          list.map((item) => (
            <div key={item.uuid} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow h-40 bg-white">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-md mr-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-gray-900 truncate" title={item.meta?.name || item.uuid}>
                    {item.meta?.name || item.uuid}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 truncate">ID: {item.uuid}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Documents</span>
                  <span className="text-sm font-bold text-blue-600">{item.meta?.doc_ids?.length || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && list.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
              No knowledge base found. Click the "+" to create one.
          </div>
      )}
    </div>
  );
}
