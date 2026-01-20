"use client";

import React, { useEffect, useState } from "react";
import { Assistant } from "../assistant";
import { createScript } from "@/service/createScript";

interface KeyPoint {
  content: string;
  teaching_script: string;
}

interface Step {
  content: string;
  teaching_script: string;
}

interface Slide {
  title: string;
  slide_type: string;
  key_points?: KeyPoint[];
  steps?: Step[];
  check_list?: string[];
  takeaway?: string;
  transition_from_prev?: string;
  transition_to_next?: string;
  final_closing?: string;
}

interface ScriptData {
  topic: string;
  target_audience: string;
  slides: Slide[];
}

export default function ScriptPage() {
  const [data, setData] = useState<ScriptData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createScript()
      .then((res: any) => {
        console.log("createScript success:", res);
        setData(res.data);
      })
      .catch((err) => {
        console.error("createScript error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Assistant>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </Assistant>
    );
  }

  if (!data) {
    return (
      <Assistant>
        <div className="flex items-center justify-center h-full">
          <p>No data available.</p>
        </div>
      </Assistant>
    );
  }

  return (
    <Assistant>
      <div className="h-full overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <header className="mb-8 border-b pb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{data.topic}</h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-400">
                {data.target_audience}
              </span>
            </div>
          </header>

          <main className="space-y-12 pb-12">
            {data.slides && data.slides.map((slide, slideIndex) => (
              <div key={slideIndex} className="space-y-4">
                {/* Transition From Previous */}
                {slide.transition_from_prev && (
                  <div className="flex justify-center">
                    <div className="bg-amber-50 text-amber-700 text-xs px-4 py-1.5 rounded-full border border-amber-200 italic shadow-sm">
                      <span className="font-bold mr-2">Transition From Previous:</span>
                      {slide.transition_from_prev}
                    </div>
                  </div>
                )}

                <section className="bg-white rounded-lg shadow-md border p-6 relative overflow-hidden">
                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 ${
                    slide.slide_type === 'summary' ? 'bg-green-100' : 
                    slide.slide_type === 'process' ? 'bg-blue-100' : 'bg-gray-100'
                  }`} />

                  <div className="flex items-center justify-between mb-6 relative">
                    <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4">
                      {slide.title}
                    </h2>
                    <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border shadow-sm ${
                      slide.slide_type === 'summary' ? 'bg-green-100 text-green-700 border-green-200' : 
                      slide.slide_type === 'process' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {slide.slide_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-10 gap-8 relative">
                    {/* Vertical Divider */}
                    <div className="absolute left-[60%] top-0 bottom-0 w-px bg-gray-200 -translate-x-4 hidden lg:block" />

                    {/* Left Column (6/10) - PPT Slide Outline (16:9) */}
                    <div className="col-span-6 space-y-4">
                      <div className="aspect-video bg-white rounded-lg border-2 border-gray-300 shadow-inner relative p-8 flex flex-col overflow-hidden">
                        <div className="absolute top-2 right-4 text-[8px] font-bold text-gray-300 tracking-widest uppercase">
                          16:9 SLIDE PREVIEW
                        </div>

                        <h3 className="text-lg font-bold text-blue-900 mb-6 border-b pb-2">
                          {slide.title}
                        </h3>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
                          <style jsx>{`
                            .no-scrollbar::-webkit-scrollbar {
                              display: none;
                            }
                            .no-scrollbar {
                              -ms-overflow-style: none;
                              scrollbar-width: none;
                            }
                          `}</style>
                          {slide.slide_type === "summary" ? (
                            <ul className="space-y-3">
                              {slide.check_list && slide.check_list.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                                  <span className="flex-shrink-0 w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="list-disc list-inside space-y-3">
                              {slide.slide_type === "process" ? (
                                slide.steps && slide.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm text-gray-700 leading-relaxed marker:text-blue-500">
                                    {step.content}
                                  </li>
                                ))
                              ) : (
                                slide.key_points && slide.key_points.map((point, pointIndex) => (
                                  <li key={pointIndex} className="text-sm text-gray-700 leading-relaxed marker:text-blue-500">
                                    {point.content}
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                        </div>

                        {slide.slide_type === "summary" && slide.takeaway && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="bg-purple-50 text-purple-800 p-3 rounded border border-purple-100 text-xs font-semibold">
                              <span className="text-[10px] uppercase block mb-1 opacity-60">Homework/Takeaway</span>
                              {slide.takeaway}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column (4/10) - Subtitles/Script */}
                    <div className="col-span-4 space-y-4">
                      <div className={`p-5 rounded-xl border h-full relative ${
                        slide.slide_type === 'summary' ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'
                      }`}>
                        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${
                          slide.slide_type === 'summary' ? 'text-indigo-400' : 'text-blue-400'
                        }`}>
                          {slide.slide_type === 'summary' ? 'Final Closing' : 'Teaching Script'}
                        </h3>
                        <div className="space-y-5">
                          {slide.slide_type === "process" ? (
                            slide.steps && slide.steps.map((step, stepIndex) => (
                              <div key={stepIndex} className="text-gray-700 text-sm leading-relaxed relative pl-4 border-l-2 border-blue-200">
                                {step.teaching_script}
                              </div>
                            ))
                          ) : slide.slide_type === "summary" ? (
                            <div className="text-indigo-900 text-base font-medium leading-relaxed italic pr-2">
                              {slide.final_closing}
                            </div>
                          ) : (
                            slide.key_points && slide.key_points.map((point, pointIndex) => (
                              <div key={pointIndex} className="text-gray-700 text-sm leading-relaxed relative pl-4 border-l-2 border-blue-200">
                                {point.teaching_script}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Transition To Next */}
                {slide.transition_to_next && (
                  <div className="flex justify-center">
                    <div className="bg-indigo-50 text-indigo-700 text-xs px-4 py-1.5 rounded-full border border-indigo-200 italic shadow-sm">
                      <span className="font-bold mr-2">Transition To Next:</span>
                      {slide.transition_to_next}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Final script end marker */}
            <div className="mt-16 text-center border-t pt-8">
              <span className="bg-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                End of Script
              </span>
            </div>
          </main>
        </div>
      </div>
    </Assistant>
  );
}
