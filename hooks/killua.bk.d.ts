import { ThunderType } from "../types/thunder.type";
declare function useKillua<T>(args: ThunderType): {
    thunder: T;
    setThunder: (value: T | ((value: T) => T)) => void;
    isReady: Boolean;
    reducers: Record<string, Function>;
};
export default useKillua;
