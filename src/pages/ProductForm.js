// pages/ProductForm.jsx
import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import GeneralTab from "../components/tabs/GeneralTab";
import DataTab from "../components/tabs/DataTab";
import LinkTab from "../components/tabs/LinksTab";
import ImageTab from "../components/tabs/ImagesTab";
import VariantsTab from "../components/tabs/VariationsTab";

const ProductForm = () => {
  const [key, setKey] = useState("general");

  const goToNextTab = () => {
    const tabOrder = ["general", "data", "link", "image", "variants"];
    const currentIndex = tabOrder.indexOf(key);
    if (currentIndex < tabOrder.length - 1) {
      setKey(tabOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="container mt-4">
      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="general" title="General">
          <GeneralTab onNext={goToNextTab} />
        </Tab>
        <Tab eventKey="data" title="Data">
          <DataTab onNext={goToNextTab} />
        </Tab>
        <Tab eventKey="link" title="Link">
          <LinkTab onNext={goToNextTab} />
        </Tab>
        <Tab eventKey="image" title="Image">
          <ImageTab onNext={goToNextTab} />
        </Tab>
        <Tab eventKey="variants" title="Variants">
          <VariantsTab onNext={goToNextTab} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProductForm;
