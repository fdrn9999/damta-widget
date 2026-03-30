import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";

export function About() {
  const link = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    openUrl(url);
  };

  return (
    <div className="bg-[#1e1e1e] text-gray-200 w-full h-full flex flex-col items-center justify-center p-8">
      <button
        onClick={() => getCurrentWindow().close()}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-300"
      >
        ✕
      </button>

      <div className="text-center space-y-4">
        <div className="text-4xl mb-2">🚬</div>
        <h1 className="text-xl font-bold">담타 위젯</h1>
        <p className="text-sm text-gray-400">v1.0.0</p>
        <p className="text-sm text-gray-300 mt-4">
          당신의 바탕화면 위 작은 흡연실
        </p>

        <div className="mt-6 space-y-1 text-sm">
          <p>Made by 정진호</p>
          <p>
            <a
              href="#"
              onClick={link("mailto:ckato9173@gmail.com")}
              className="text-orange-400 hover:underline"
            >
              ckato9173@gmail.com
            </a>
          </p>
          <p>
            <a
              href="#"
              onClick={link("https://github.com/fdrn9999")}
              className="text-orange-400 hover:underline"
            >
              github.com/fdrn9999
            </a>
          </p>
        </div>

        <div className="border-t border-gray-700 my-4 w-48 mx-auto" />

        <div className="text-xs text-gray-400 space-y-1">
          <p>Inspired by 온라인 담타</p>
          <p>
            <a
              href="#"
              onClick={link("https://www.damta.world/")}
              className="text-orange-400 hover:underline"
            >
              damta.world
            </a>{" "}
            — 다같이 담배 타임
          </p>
          <p className="mt-2 leading-relaxed">
            원작의 가상 흡연 시뮬레이션 UX에서
            <br />
            영감을 받아 데스크톱 위젯으로
            <br />
            재해석하였습니다.
          </p>
        </div>

        <p className="text-[10px] text-gray-600 mt-6">
          © 2025 Jinho Jeong. MIT License
        </p>
      </div>
    </div>
  );
}
