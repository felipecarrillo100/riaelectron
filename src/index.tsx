import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes} from "react-router-dom";
import {About} from "./pages/About";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);



// Add all icons to the library so you can use it in your page
library.add(fas, far, fab)


export default function Router() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/"  element={<App />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </HashRouter>
    );
}

root.render(
    <Router />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
