import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl,
  shadowUrl: iconShadow,
  iconRetinaUrl: iconRetinaUrl,
});

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: iconUrl.src,
  shadowUrl: iconShadow.src,
  iconRetinaUrl: iconUrl.src,
});