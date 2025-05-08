import Topbar from "./components/topbar/Topbar";
import Intro from "./components/intro/Intro";
import Portfolio from "./components/portfolio/Portfolio";
import Skills from "./components/skills/Skills";
import Contact from "./components/contact/Contact";
import Menu from "./components/menu/Menu";
import "./app.scss";
import "./global.scss";
import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const getTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "true"; // stored as string, convert to boolean
  };
  
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme.toString());

  }, [theme]);

  function Checkbox() {
    if (document.getElementById("checkbox").checked === true) {
      //
      setTheme(true);
    } else {
      //
      setTheme(false);
    }
  }
  return (
    <div className={"app" }>
      
      <div className={"bkg1 " + (theme && "active")}></div>
      <div className={"bkg " + (theme && "active")}>
      
        <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
         <div className="banner">
        </div> 
        <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="btn3 ">
          <label className="switch">
            <input
              type="checkbox"
              id="checkbox"
              checked={theme}
              onChange={() => {
                Checkbox();
              }}
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="sections" onClick={() => setMenuOpen(false)}>
          <Intro />
          <Portfolio />
          <Skills />

          <div className="cont">
            <Contact />
          </div>
        </div>
      
    </div></div>
  );
}

export default App;
