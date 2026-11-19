import React from "react";

interface BreadcrumbProps {
    title: string;
    paths: { name: string; link?: string }[];
    backgroundImage?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ title, paths, backgroundImage }) => {
    return (
        <section
            className="page-title"
            style={{ backgroundImage: `url(${backgroundImage || 'assets/images/resource/page-title-bg.png'})` }}
        >
            <div className="auto-container">
                <div className="title-outer text-center">
                    <h1 className="title">{title}</h1>
                    <ul className="page-breadcrumb">
                        {paths.map((path, index) => (
                            <li key={index}>
                                {path.link ? <a href={path.link}>{path.name}</a> : path.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Breadcrumb;
/*
2️⃣ Exemple d’utilisation pour la page About Us
import Breadcrumb from "./Breadcrumb";

const AboutPage = () => {
  return (
    <>
      <Breadcrumb
        title="About Us"
        paths={[
          { name: "Home", link: "/" },
          { name: "About Us" },
        ]}
        backgroundImage="assets/images/resource/page-title-bg.png"
      />

</>
);
};

export default AboutPage;

 */