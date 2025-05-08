import { useEffect, useState } from "react";
import PortfolioList from "../portfolioList/PortfolioList";
import "./portfolio.scss";
import Aos from 'aos';
import 'aos/dist/aos.css';

import {
  featuredPortfolio,
  webPortfolio,
  mobilePortfolio,
  designPortfolio,
  contentPortfolio,
} from "../Data/data";
import { GitHub, LinkOutlined } from "@material-ui/icons";

export default function Portfolio() {

  // var t;
  //  function myFunction() {
  //   var x = document.getElementById("if");
  //   if (item.link==true) {
  //      x.style.display = "block";
  //    } else {
  //      x.style.display = "none";
  //    }
  //  }



  useEffect(() =>{
   
    Aos.init({duration:2000});
    
  },[]);

  const [selected, setSelected] = useState("featured");
  const [data, setData] = useState([]);
  const list = [
    {
      id: "featured",
      title: "Featured",
    },
    {
      id: "webApp",
      title: "WebApp",
    },
    {
      id: "mobileApp",
      title: "MobileApp",
    },
    {
      id: "design",
      title: "Design",
    },
    {
      id: "Games",
      title: "Games",
    },
  ];
  useEffect(() => {
    switch (selected) {
      case "featured":
        setData(featuredPortfolio);
        break;
      case "webApp":
        setData(webPortfolio);
        break;
      case "mobileApp":
        setData(mobilePortfolio);
        break;
      case "design":
        setData(designPortfolio);
        break;
      case "Games":
        setData(contentPortfolio);
        break;
      default:
        setData(featuredPortfolio);
        break;
    }
  }, [selected]);
  return (
    <div  className="portfolio" id="portfolio">
      <div  data-aos="fade-up"  className="txt">Projects</div>
      <ul data-aos="fade-up" data-aos-delay="200">
        {list.map((item) => (
          <PortfolioList
            key={item.id}
            title={item.title}
            active={selected === item.id}
            setSelected={setSelected}
            id={item.id}
          />
        ))}
      </ul>
      <div data-aos="fade-up" data-aos-delay="300" className="container">
        {data.map((d) => (
          <div className="item brd">
            <img src={d.img} alt="" />
            <h3>{d.title}</h3>

            <a
              className="b1"
              href={d.link}
              onClick={() => {
                if (d.link === true)
                  document.getElementById("if").style.display = "block";
                  document.getElementById("ifr").src="https://itch.io/embed-upload/5984634?color=333333";
              }}
              target="_blank"
              rel="noreferrer"
            >
              <LinkOutlined className="icon" />
              <span></span>
            </a>
            <a className="b2" href={d.github} target="_blank" rel="noreferrer">
              <GitHub className="icon" />
              <span></span>
            </a>
          </div>
        ))}
      </div>

      <div id="if" className="game">
        <button
          className="b3"
          onClick={() => {
            document.getElementById("if").style.display = "none";
            
          }}
        >
          x
        </button>
        <div className="b5">
          This game can't run on mobile devices' browsers 😕.
        </div>
        <iframe
          id='ifr'
          title="fr"
          frameBorder="0"
          src=""
          allowFullScreen=""
        ></iframe>
      </div>
    </div>
  );
}
