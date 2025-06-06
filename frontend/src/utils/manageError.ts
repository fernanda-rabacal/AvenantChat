import axios from "axios";
import { destroyCookie, parseCookies } from "nookies";
import { toast } from "sonner";

export function manageError(error: unknown, function_origin_name: string, function_goal: string) {
  console.error(`${function_origin_name} error >> `, error);

  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK' && function_origin_name === 'getUserByToken') return;

    if (error.response?.status === 401) {
      const cookies = parseCookies();

      for (const cookieName in cookies) {
        if (cookieName.startsWith('avenant_token_')) {
          destroyCookie(undefined, cookieName);
        }
      }
    }

    toast.error(error.response?.data.message || `Unexpected error while ${function_goal}`);
  }
}