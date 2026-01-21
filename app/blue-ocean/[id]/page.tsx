import { notFound } from "next/navigation";
import {
  getAnalysisById,
  getCompetitors,
  getERRCMatrix,
  getStrategyCanvas,
  getPainPoints,
  getValueEstimates,
  getRoadmap,
} from "@/lib/actions/blueocean.actions";
import { AnalysisDetailClient } from "./AnalysisDetailClient";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [analysis, competitors, errc, canvas, painPoints, estimates, roadmap] = await Promise.all([
    getAnalysisById(id),
    getCompetitors(id),
    getERRCMatrix(id),
    getStrategyCanvas(id),
    getPainPoints(id),
    getValueEstimates(id),
    getRoadmap(id),
  ]);

  if (!analysis) {
    notFound();
  }

  return (
    <AnalysisDetailClient
      analysis={analysis}
      competitors={competitors}
      errc={errc}
      canvas={canvas}
      painPoints={painPoints}
      estimates={estimates}
      roadmap={roadmap}
    />
  );
}
