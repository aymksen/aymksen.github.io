import "./intro.scss";
import { KeyboardArrowDown } from "@material-ui/icons";
import pdf from './MyCv.pdf'
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from "react";

export default function Intro({ menuOpen, setMenuOpen }) {

  useEffect(() =>{
   
    Aos.init({duration:2000});
  },[]);

  return (
    <div className="intro" id="intro">
      <div className="left">
        <div className="imgContainer btext">&lt;/&gt;</div>
      </div>
      <div className="right">
        <div data-aos="fade-up" className="btext big">Hi, I'm Aymen</div>
        <div data-aos="fade-up" data-aos-delay="200"  className="btext tex">
          I'm a front-end developer with a background in graphic design, and I
          love to explore new features and implement functionality. 
        </div>
        <a data-aos="fade-up" data-aos-delay="300" href={pdf} target="_blank" rel="noreferrer">
        <button className="button" id="Resume">Check out my Resume</button></a>
      </div>

      <KeyboardArrowDown className="arr" />
    </div>
  );
}
