'use client';

import { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink, Building2, TrendingUp, Zap, Clock } from 'lucide-react';
import type { NewsItem } from '@/lib/db-queries';
import { format } from 'date-fns';

function NewsCard({ item, variant }: { item: NewsItem; variant: 'creatio' | 'bfsi' }) {
  const isCreatio = variant === 'creatio';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 hover:border-linkedin/30 hover:shadow-card-hover transition-all group">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isCreatio ? 'bg-linkedin-light text-linkedin' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isCreatio ? <Building2 className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              isCreatio ? 'text-linkedin' : 'text-emerald-600'
            }`}>
              {isCreatio ? 'Creatio' : 'BFSI Tech'}
            </span>
            {item.published_at && (
              <span className="text-[10px] text-slate-400">{item.published_at}</span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-2 group-hover:text-linkedin transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.summary}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-linkedin hover:underline flex items-center gap-1"
              >
                Read more <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {!isCreatio && (
              <button className="text-xs text-slate-400 hover:text-linkedin transition-colors flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Use as topic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlignmentCard({ title, creatio, bitloom }: { title: string; creatio: string; bitloom: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-4">
      <h4 className="text-xs font-semibold text-slate-800 mb-3">{title}</h4>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-linkedin bg-linkedin-light px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">Creatio</span>
          <p className="text-xs text-slate-600">{creatio}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">Bitloom</span>
          <p className="text-xs text-slate-600">{bitloom}</p>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [creatio, setCreatio] = useState<NewsItem[]>([]);
  const [bfsi, setBfsi] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchNews = async (force = false) => {
    force ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch(`/api/news${force ? '?refresh=1' : ''}`);
      const data = await res.json();
      setCreatio(data.creatio ?? []);
      setBfsi(data.bfsi ?? []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const ALIGNMENTS = [
    {
      title: 'AI-Driven Loan Origination',
      creatio: 'Pre-built BFSI process flows with intelligent document extraction and risk scoring automation.',
      bitloom: 'Configure and deploy Creatio loan workflows for regional banks — typically 6-8 week implementations.',
    },
    {
      title: 'No-Code Insurance Claims',
      creatio: 'Visual process designer enables claims teams to automate routing, approvals, and SLA tracking without IT.',
      bitloom: 'Train ops teams and customize Creatio for claims automation, reducing manual effort by 40-60%.',
    },
    {
      title: 'Wealth Management CRM',
      creatio: '360° client view with automated portfolio alerts, KYC/AML workflow, and advisor productivity tools.',
      bitloom: 'Implement Creatio for IFAs and wealth advisors, integrating with existing portfolio management systems.',
    },
  ];

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-5 h-5 text-linkedin" />
            <h1 className="text-xl font-bold text-slate-900">Intelligence Feed</h1>
          </div>
          <p className="text-sm text-slate-500">
            Creatio product news + BFSI tech trends aligned with Bitloom&apos;s practice
          </p>
          {lastRefresh && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400">
                Refreshed {format(lastRefresh, 'HH:mm')}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-1.5" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-1.5" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Two-column news layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Creatio News */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-linkedin" />
                <h2 className="text-sm font-bold text-slate-800">Creatio News</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {creatio.length} articles
                </span>
                <a
                  href="https://www.creatio.com/company/news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-linkedin hover:underline flex items-center gap-1"
                >
                  View on Creatio.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-3">
                {creatio.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <Building2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No Creatio news loaded</p>
                    <button
                      onClick={() => fetchNews(true)}
                      className="text-xs text-linkedin hover:underline mt-1"
                    >
                      Refresh to fetch latest
                    </button>
                  </div>
                ) : (
                  creatio.map(item => <NewsCard key={item.id} item={item} variant="creatio" />)
                )}
              </div>
            </div>

            {/* BFSI Insights */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold text-slate-800">BFSI Tech Trends</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  AI-curated · {bfsi.length} insights
                </span>
              </div>
              <div className="space-y-3">
                {bfsi.length === 0 ? (
                  <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <TrendingUp className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No BFSI insights loaded</p>
                    <button
                      onClick={() => fetchNews(true)}
                      className="text-xs text-linkedin hover:underline mt-1"
                    >
                      Generate insights
                    </button>
                  </div>
                ) : (
                  bfsi.map(item => <NewsCard key={item.id} item={item} variant="bfsi" />)
                )}
              </div>
            </div>
          </div>

          {/* Alignment matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-linkedin" />
              <h2 className="text-sm font-bold text-slate-800">Creatio × Bitloom Alignment</h2>
              <span className="text-xs text-slate-400">How BFSI trends translate to Bitloom opportunities</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ALIGNMENTS.map((a, i) => (
                <AlignmentCard key={i} {...a} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
