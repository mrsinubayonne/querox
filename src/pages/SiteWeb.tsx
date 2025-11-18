
import React from "react";
import SiteWebContainer from "./SiteWebContainer";
import SubscriptionPopup from "@/components/SubscriptionPopup";
import PageWithSidebar from "../components/PageWithSidebar";

const SiteWeb: React.FC = () => {
  return (
    <PageWithSidebar>
      <SiteWebContainer />
      <SubscriptionPopup />
    </PageWithSidebar>
  );
};

export default SiteWeb;
