import type { PinKey } from './mapShared';

export const PIN_IMAGES: Record<`pin-${PinKey}`, number> = {
  'pin-veterinaria': require('../../../assets/map/pin-veterinaria.png'),
  'pin-urgencia': require('../../../assets/map/pin-urgencia.png'),
  'pin-tienda': require('../../../assets/map/pin-tienda.png'),
  'pin-farmacia': require('../../../assets/map/pin-farmacia.png'),
};
