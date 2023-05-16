#!/usr/bin/env bb
(require '[clojure.java.io :as io]
         '[cheshire.core :as json]
         '[babashka.fs :as fs])

(def entries
  (->> (fs/glob "." "*.hbs")
       (map (fn [p] (slurp (io/file (str p)))))
       (mapcat (fn [file-contents]
                 (map second (re-seq #"\{\{t \"(.*)\"\}\}" file-contents))))
       (set)
       (map (fn [s] [s s]))
       (into {})))

(println (json/generate-string entries {:pretty true}))
