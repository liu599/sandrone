"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Assistant } from "../../assistant";
import { generateScript } from "@/service/createScript";
import { Button } from "@/components/ui/button";

const AUDIENCE_TYPES = [
  { value: "k12_basic", label: "中小学生：强调趣味、具象、互动" },
  { value: "hs_foundation", label: "高一/高二：夯实基础、逻辑推导、知识建模" },
  { value: "hs_exam_prep", label: "高三：应试导向、二级结论、提分技巧" },
  { value: "college_student", label: "大学生：强调系统、理论、学术" },
  { value: "professional", label: "职场专业人士：强调实用、效率、行业术语" },
  { value: "executive", label: "高层管理者：强调结论、ROI、战略视野" },
  { value: "general", label: "普通大众（兜底）：强调通俗、易懂、清晰" },
];

export default function NewScriptPage() {
  const router = useRouter();
  const [instruction, setInstruction] = useState("\n" +
    "        你是一个经验丰富的资深AI产品经理, 现在你需要根据这份材料准备一下AI产品经理培训课程, 这门课的初衷是让产品经理能够具备基本的AI技术视野。\n" +
    "        你需要将你的听众称为: 各位同学\n" +
    "        如果你需要自称, 你叫\"老瑞老师\"\n" +
    "        你的目的是让大家尽量能够从身边常见的事物中来了解专业术语, 可以使用常见的事物或者IT专业众所周知的常识来比喻, 穿插着一些小幽默, 这样大家可以留下深刻印象来变为直觉。\n");
  const [content, setContent] = useState("");
  const [audienceType, setAudienceType] = useState("general");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // images is an empty array as requested
      const res = await generateScript([], ` ${instruction} 需要讲的内容 ${content}`, audienceType);
      console.log("generateScript success:", res);
      // After success, we might want to navigate back to the script list or the newly created script.
      // For now, let's just go back to the script page.
      router.push("/script");
    } catch (err) {
      console.error("generateScript error:", err);
      // alert("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Assistant>
      <div className="h-full overflow-y-auto">
        <div className="p-8 max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">New Script</h1>
            <p className="text-gray-500">Create a new teaching script by providing instructions and content.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="instruction" className="text-sm font-medium">
                Instruction (文本指令)
              </label>
              <textarea
                id="instruction"
                className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter instructions..."
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content (文本内容)
              </label>
              <textarea
                id="content"
                className="w-full min-h-[200px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="audience" className="text-sm font-medium">
                Audience Type
              </label>
              <select
                id="audience"
                className="w-full p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
              >
                {AUDIENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Script"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Assistant>
  );
}
