// Buttons on the masthead (charcoal in both themes) keep one fixed look:
// no background in any state and white text, so clicking or hovering never
// changes their colour. Use together with the `masthead-button` class
// (TopBar.vue), which also pins this in CSS and shows keyboard focus as a
// ring, and `native-focus-behavior`.
const none = 'rgba(0, 0, 0, 0)'
const white = '#ffffff'
export const mastheadButtonTheme = {
  colorQuaternary: none,
  colorQuaternaryHover: none,
  colorQuaternaryPressed: none,
  colorFocus: none,
  textColor: white,
  textColorHover: white,
  textColorPressed: white,
  textColorFocus: white,
  textColorQuaternary: white,
  rippleDuration: '0s',
}
