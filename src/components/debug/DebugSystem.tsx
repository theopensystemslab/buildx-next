import { useSystemsData } from "@/contexts/SystemsData"
import { systems } from "@/data/system"
import { StrOrd } from "@/utils"
import { sort, filterMap } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import { useControls } from "leva"
import { Fragment, Suspense } from "react"
import DebugModule from "./DebugModule"

const DebugSystem = () => {
  const { modules: allModules } = useSystemsData()

  const { system } = useControls({
    system: {
      options: systems.map((x) => x.id),
      value: systems[0].id,
    },
  }) as {
    system: string
  }

  const moduleOptions = pipe(
    allModules,
    filterMap((module) =>
      module.systemId === system ? some(module.dna) : none
    ),
    sort(StrOrd)
  )

  const { moduleDna } = useControls(
    {
      moduleDna: {
        options: moduleOptions,
        value: moduleOptions[0],
      },
    },
    [system]
  )

  return (
    <Fragment>
      {pipe(
        allModules,
        filterMap((module) =>
          module.systemId === system && module.dna === moduleDna
            ? some(
                <Suspense key={moduleDna} fallback={null}>
                  <DebugModule module={module} />
                </Suspense>
              )
            : none
        )
      )}
    </Fragment>
  )
}

export default DebugSystem
