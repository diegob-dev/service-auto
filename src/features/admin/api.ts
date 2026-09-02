import { supabase } from "@/lib/supabase";
import type { CarRecord } from "@/features/cars/types";
import type { AdminUser, CarInput } from "./types";

function resultOrThrow<T>(data: T | null, error: { message: string } | null) {
  if (error) throw new Error(error.message);
  return data as T;
}

export async function login(username: string, password: string) {
  const { data, error } = await supabase.rpc("admin_login", {
    p_username: username,
    p_password: password,
  });
  return resultOrThrow<string>(data, error);
}

export async function logout(token: string) {
  const { error } = await supabase.rpc("admin_logout", { p_token: token });
  if (error) throw new Error(error.message);
}

export async function listCars(token: string) {
  const { data, error } = await supabase.rpc("admin_list_cars", {
    p_token: token,
  });
  return resultOrThrow<CarRecord[]>(data, error);
}

export async function saveCar(token: string, car: CarInput) {
  const { data, error } = await supabase.rpc("admin_save_car", {
    p_token: token,
    p_car: car,
  });
  return resultOrThrow<CarRecord>(data, error);
}

export async function deleteCar(token: string, id: string) {
  const { error } = await supabase.rpc("admin_delete_car", {
    p_token: token,
    p_car_id: id,
  });
  if (error) throw new Error(error.message);
}

export async function listUsers(token: string) {
  const { data, error } = await supabase.rpc("admin_list_users", {
    p_token: token,
  });
  return resultOrThrow<AdminUser[]>(data, error);
}

export async function saveUser(
  token: string,
  user: { id?: string; username: string; password?: string; active: boolean },
) {
  const { data, error } = await supabase.rpc("admin_save_user", {
    p_token: token,
    p_user: user,
  });
  return resultOrThrow<AdminUser>(data, error);
}
