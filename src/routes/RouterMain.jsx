import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageMotivation from "../pages/PageMotivation";
import PageMusic from "../pages/PageMusic";
import PagePuzzle from "../pages/PagePuzzle";
import PageWebsite from "../pages/PageWebsite";
import PageTetris from "../pages/PageTetris";
import PageBreakout from "../pages/PageBreakout";

export default function RouterMain() {
  return (
    <Router basename="/alduin">
      <Routes>
        <Route path="/" element={<PageMotivation />} />
        <Route path="/music" element={<PageMusic />} />
        <Route path="/puzzle" element={<PagePuzzle />} />
        <Route path="/website" element={<PageWebsite />} />
        <Route path="/tetris" element={<PageTetris />} />
        <Route path="/breakout" element={<PageBreakout />} />
      </Routes>
    </Router>
  );
}
