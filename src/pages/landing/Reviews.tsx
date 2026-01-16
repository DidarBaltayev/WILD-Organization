"use client";
import { useState } from "react";
const data = [
  { name:"Andy", text:"Skill-based matchmaking, better than standard MM." },
  { name:"Andy 2", text:"AC reduces cheaters in higher-tier matches." },
  { name:"Andy 3", text:"Enjoy tournaments and chances to win prizes." },
];
export default function Reviews(){
  const [i,setI]=useState(0);
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1082px] px-4">
        <h3 className="display text-3xl font-extrabold mb-6">Reviews</h3>
        <div className="relative rounded-xl border border-[color:var(--wild-stroke)] bg-[color:var(--wild-panel)]/60 p-6">
          <div className="text-sm text-neutral-300">{data[i].text}</div>
          <div className="mt-3 text-xs opacity-70">— {data[i].name}</div>
          <button onClick={()=>setI((i+data.length-1)%data.length)} className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">‹</button>
          <button onClick={()=>setI((i+1)%data.length)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">›</button>
        </div>
      </div>
    </section>
  );
}
