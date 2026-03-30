"use client";

import { useMap } from "react-leaflet";
import { useEffect, useState, useCallback } from "react";

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;

export default function ZoomControls() {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => { map.off("zoomend", handleZoom); };
  }, [map]);

  const handleZoomIn = useCallback(() => {
    if (zoom < MAX_ZOOM) map.zoomIn();
  }, [map, zoom]);

  const handleZoomOut = useCallback(() => {
    if (zoom > MIN_ZOOM) map.zoomOut();
  }, [map, zoom]);

  const isMaxZoom = zoom >= MAX_ZOOM;
  const isMinZoom = zoom <= MIN_ZOOM;

  return (
    <div style={{position:"absolute",top:"16px",left:"16px",zIndex:1000,display:"flex",flexDirection:"column",backgroundColor:"#ffffff",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.18)",overflow:"hidden",width:"36px"}}>
      <button onClick={handleZoomIn} disabled={isMaxZoom} style={{width:"36px",height:"36px",border:"none",backgroundColor:"transparent",fontSize:"22px",fontWeight:"600",cursor:isMaxZoom?"not-allowed":"pointer",color:isMaxZoom?"#d1d5db":"#374151",display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Zoom in">+</button>
      <div style={{height:"1px",backgroundColor:"#e5e7eb",margin:"0 6px"}}/>
      <button onClick={handleZoomOut} disabled={isMinZoom} style={{width:"36px",height:"36px",border:"none",backgroundColor:"transparent",fontSize:"22px",fontWeight:"600",cursor:isMinZoom?"not-allowed":"pointer",color:isMinZoom?"#d1d5db":"#374151",display:"flex",alignItems:"center",justifyContent:"center"}} aria-label="Zoom out">−</button>
    </div>
  );
}