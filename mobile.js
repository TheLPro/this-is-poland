const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet-n";
    }
    if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile-n";
    }
    return "desktop-n";
  };
console.log(getDeviceType()); // "mobile", "tablet", or "desktop"
if (getDeviceType() != "mobile-n") {
    window.location.href = "desktop.html";
}