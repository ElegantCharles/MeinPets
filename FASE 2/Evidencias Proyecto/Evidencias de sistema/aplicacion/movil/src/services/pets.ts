import { API_CONFIG } from '../config/api';
import { request } from './http';

export interface Breed {
  id: number;
  especie_id: number;
  nombre: string;
}

export interface Species {
  id: number;
  nombre: string;
  razas: Breed[];
}

export interface PetTutor {
  id: number;
  nombre_completo: string;
  email: string;
  es_tutor_principal: boolean;
}

export interface Pet {
  id: number;
  nombre: string;
  especie_id: number;
  especie_nombre: string;
  raza_id: number | null;
  raza_nombre: string | null;
  fecha_nacimiento: string;
  sexo: 'macho' | 'hembra';
  esterilizado: boolean;
  numero_chip: string | null;
  foto_url: string | null;
  es_tutor_principal: boolean;
  tutores?: PetTutor[];
}

export interface PetFormPayload {
  nombre: string;
  especie_id: number;
  raza_id: number | null;
  fecha_nacimiento: string;
  sexo: 'macho' | 'hembra';
  esterilizado: boolean;
  numero_chip?: string | null;
  foto_url?: string | null;
}

const { SPECIES, PETS } = API_CONFIG.ENDPOINTS;

export function formatPetAge(fechaNacimiento: string): string {
  const parts = fechaNacimiento.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    return fechaNacimiento;
  }

  const [birthYear, birthMonth, birthDay] = parts;
  const now = new Date();
  let years = now.getFullYear() - birthYear;
  let months = now.getMonth() + 1 - birthMonth;

  if (now.getDate() < birthDay) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return 'Recién nacido';
  }

  if (years === 0 && months <= 0) {
    return 'Menos de 1 mes';
  }

  if (years === 0) {
    return months === 1 ? '1 mes' : `${months} meses`;
  }

  const yearLabel = years === 1 ? '1 año' : `${years} años`;
  if (months === 0) {
    return yearLabel;
  }

  const monthLabel = months === 1 ? '1 mes' : `${months} meses`;
  return `${yearLabel} y ${monthLabel}`;
}

export async function fetchSpeciesCatalog(): Promise<Species[]> {
  const { species } = await request<{ species?: Species[] }>(SPECIES.LIST, {
    auth: false,
    fallbackError: 'No se pudo cargar el catálogo de especies',
  });
  return species ?? [];
}

export async function fetchPets(): Promise<Pet[]> {
  const { pets } = await request<{ pets?: Pet[] }>(PETS.LIST, {
    fallbackError: 'No se pudo obtener el listado de mascotas',
  });
  return pets ?? [];
}

export async function fetchPetById(id: number): Promise<Pet> {
  const { pet } = await request<{ pet: Pet }>(PETS.DETAIL(id), {
    fallbackError: 'No se pudo cargar la ficha de la mascota',
  });
  return pet;
}

export async function createPet(payload: PetFormPayload): Promise<Pet> {
  const { pet } = await request<{ pet: Pet }>(PETS.LIST, {
    method: 'POST',
    body: payload,
    fallbackError: 'No se pudo registrar la mascota',
  });
  return pet;
}

export async function updatePet(id: number, payload: PetFormPayload): Promise<Pet> {
  const { pet } = await request<{ pet: Pet }>(PETS.DETAIL(id), {
    method: 'PUT',
    body: payload,
    fallbackError: 'No se pudo actualizar la mascota',
  });
  return pet;
}

export async function deletePet(id: number): Promise<void> {
  await request(PETS.DETAIL(id), {
    method: 'DELETE',
    fallbackError: 'No se pudo eliminar la mascota',
  });
}

export async function addPetTutor(id: number, email: string): Promise<Pet> {
  const { pet } = await request<{ pet: Pet }>(PETS.TUTORS(id), {
    method: 'POST',
    body: { email },
    fallbackError: 'No se pudo asociar al cotutor',
  });
  return pet;
}
