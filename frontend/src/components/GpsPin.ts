import L from 'leaflet'

export function createGpsIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="
          background-color:#F97316;
          color:white;
          font-size:11px;
          font-weight:700;
          padding:3px 8px;
          border-radius:12px;
          white-space:nowrap;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          letter-spacing:0.5px;
        ">GPS</div>
        <div style="position:relative;width:48px;height:48px;">
          <div style="
            background-color:#F97316;
            width:48px;
            height:48px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 3px 10px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
            width:16px;
            height:16px;
            background:white;
            border-radius:50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [48, 72],
    iconAnchor: [24, 72],
    popupAnchor: [0, -74]
  })
}
