* Variable
```
Module - capitalize(camelCase(groovyScript("_1.replace('.', '-')", fileNameWithoutExtension())))
```

* Template  
```
import { ActionTree, GetterTree, MutationTree } from "vuex";
import { IStore } from "@/store";

export interface I$Module$State {}

const state: I$Module$State = {};

const getters: GetterTree<I$Module$State, IStore> = {};

const mutations: MutationTree<IStore> = {};

const actions: ActionTree<I$Module$State, IStore> = {};

export default { state, getters, mutations, actions };
```
