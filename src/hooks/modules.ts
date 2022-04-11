import { useSystemsData } from "@/contexts/SystemsData"
import { filterCompatibleModules, LoadedModule, Module } from "@/data/module"
import { filterRA, mapO, pipeLog } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { contramap } from "fp-ts/lib/Ord"
import { Ord as StrOrd } from "fp-ts/lib/string"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import { loadModule } from "@/utils/modules"
import { toNullable } from "fp-ts/lib/Option"

export const useGetVanillaModule = () => {
  const { modules: allModules } = useSystemsData()
  return (module: LoadedModule): LoadedModule | null => {
    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    return pipe(
      systemModules,
      filterRA(
        (sysModule) =>
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType &&
          sysModule.structuredDna.levelType ===
            module.structuredDna.levelType &&
          sysModule.structuredDna.positionType === "MID"
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      mapO(loadModule),
      toNullable
    )
  }
}

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
}

export const useLayoutOptions = (module: LoadedModule | Module) => {
  const systemModules = useSystemModules(module.systemId)
  return pipe(
    systemModules,
    pipeLog,
    filterCompatibleModules([
      "sectionType",
      "positionType",
      "levelType",
      "gridType",
      "gridUnits",
    ])(module)
  )
}
