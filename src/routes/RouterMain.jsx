import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageMotivation from "../pages/PageMotivation";
import PageMusic from "../pages/PageMusic";
import PagePuzzle from "../pages/PagePuzzle";
import PageWebsite from "../pages/PageWebsite";
import PageTetris from "../pages/PageTetris";
import PageBreakout from "../pages/PageBreakout";
import PageTesting from "../pages/PageTesting";
import PagePaint from "../pages/PagePaint";
import PageMatchstick from "../pages/PageMatchstick";
import PageEmulator from "../pages/PageEmulator";
import PageWin from "../pages/PageWin";

export default function RouterMain() {
  return (
    <Router basename="/alduin">
      <Routes>
        <Route path="/" element={<PageMotivation />} />
        <Route path="/music" element={<PageMusic />} />
        <Route path="/puzzle" element={<PagePuzzle />} />
        <Route path="/matchstick" element={<PageMatchstick />} />
        <Route path="/emulator" element={<PageEmulator />} />
        <Route path="/windows" element={<PageWin />} />
        <Route path="/paint" element={<PagePaint />} />
        <Route path="/website" element={<PageWebsite />} />
        <Route path="/tetris" element={<PageTetris />} />
        <Route path="/breakout" element={<PageBreakout />} />
        <Route path="/test" element={<PageTesting />} />
      </Routes>
    </Router>
  );
}
