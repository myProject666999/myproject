import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DashboardPage from "@/pages/DashboardPage";
import ContentRankPage from "@/pages/ContentRankPage";
import TrendAnalysisPage from "@/pages/TrendAnalysisPage";
import PublishTimePage from "@/pages/PublishTimePage";
import WeeklyReportPage from "@/pages/WeeklyReportPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/content-rank" element={<ContentRankPage />} />
          <Route path="/trend-analysis" element={<TrendAnalysisPage />} />
          <Route path="/publish-time" element={<PublishTimePage />} />
          <Route path="/weekly-report" element={<WeeklyReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
