import axios from "axios";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Import components.
import Welcome from "./components/Welcome.component";
import AboutUs from "./components/AboutUs.component";
import ContactUS from "./components/ContactUS.component";
import SignIn from "./components/SignIn.component";
import SignUp from "./components/SignUp.component";
import AppLayout from "./components/AppLayout";
import "boxicons/css/boxicons.min.css";
import "./App.css";

function App() {
    const getDataHandler = () => {
        axios.get("http://localhost:5000/api/v1/user").then((res) => {
            console.log(res, "require data");
        });
    };
    return (
        <Router>
            <Routes>
                <Route path="/sidebar" element={<AppLayout />} />
                <Route exact path="/" element={<Welcome />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact-us" element={<ContactUS />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
            </Routes>
            {/* <Register />
            <AboutUs />
            <ContactUS /> */}
        </Router>
    );
}

export default App;
