"use client";
import React from "react";
import Nav from "../navbar/page";
import ReelContainer from "@/app/components/Reel/ReelContainer";
import "./reel.css";

export default function ReelPage() {
  return (
    <>
      <Nav />
      <ReelContainer />
    </>
  );
}
