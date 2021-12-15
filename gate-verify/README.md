# Pf4jCustomStagePlugin
Pf4j Custom Stage Plugin

This custom stage plugin involves 3 microservices.

     1. Orca
    
     2. Deck
     
     3. Echo

There are 2 ways of deploying plugins in the spinnaker.

## Method 1

   #### Tasks list

   - [x] Run `./gradlew clean releaseBundle`.
   - [x] Put the `build/distributions/pf4jCustomStagePlugin-v1.0.1.zip` into your github repo.
          See  [Opsmx Custom Stage Plugin Repository] (https://github.com/OpsMx/Pf4jCustomStagePlugin/releases/tag/v1.0.1).
   - [x] Configure the Spinnaker service. Put the following in the service.yml to enable the plugin and configure the extension.
   
          1.   Orca configuration
Adding the following to your orca.yml or ~/.hal/default/profiles/orca-local.yml config will load and start the latest CustomStage plugin during app startup.
```
spinnaker:
  extensibility:
    plugins:
      Opsmx.CustomStagePlugin:
        enabled: true
        version: 1.0.1
        config:
          defaultVmDetails: '{
                              "username": "ubuntu",
                              "password": "xxxxx",
                              "port": 22,
                              "server": "xx.xx.xx.xx"
                            }'
          defaultgitAccount: '{
                                "artifactAccount": "my-github-artifact-account",
                                "reference": "https://api.github.com/repos/opsmx/Pf4jCustomStagePlugin/contents/script.sh",
                                "type": "github/file",
                                "version": "main"
                              }'
    repositories:
      opsmx-repo:
        url: https://raw.githubusercontent.com/opsmx/spinnakerPluginRepository/master/repositories.json
```
          2.   Deck configuration
Adding the following to your gate.yml or ~/.hal/default/profiles/gate-local.yml config will load and start the latest CustomStage plugin during app startup.
```
spinnaker:
 extensibility:
    plugins:
    deck-proxy:
      enabled: true
      plugins:
        Opsmx.CustomStagePlugin:
          enabled: true
          version: 1.0.1
    repositories:
      opsmx-repo:
        url: https://raw.githubusercontent.com/opsmx/spinnakerPluginRepository/master/plugins.json
```

          3.   Echo configuration
Adding the following to your echo.yml or ~/.hal/default/profiles/echo-local.yml config will load and start the latest CustomStage plugin during app startup.
```
spinnaker:
  extensibility:
    plugins:
      Opsmx.CustomStagePlugin:
        enabled: true
        version: 1.0.1
    repositories:
      opsmx-repo:
        url: https://raw.githubusercontent.com/opsmx/spinnakerPluginRepository/master/repositories.json
```   
   - [x] Restart the microservices.

## Method 2

   #### Tasks list

   - [x] Run `./gradlew clean releaseBundle`.
   - [x] Put the `<custom-stage-orca>/build/distributions/orca.zip` into spinnaker's microservice plugins root directory.
         Default spinnaker's microservice plugins root directory is `<opt>/<microservice>/plugins/`. eg:- (opt/orca/plugins).
   - [x] Do the same for Echo microservice as in **step 2**.
   - [x] Configure the Spinnaker service. Put the following in the service.yml to enable the plugin and configure the extension.
   
          1.   Orca configuration
Adding the following to your orca.yml or ~/.hal/default/profiles/orca-local.yml config will load and start the latest CustomStage plugin during app startup.
```
spinnaker:
  extensibility:
    plugins:
      Opsmx.CustomStagePlugin:
        enabled: true
        version: 1.0.1
        config:
          defaultVmDetails: '{
                              "username": "ubuntu",
                              "password": "xxxxx",
                              "port": 22,
                              "server": "xx.xx.xx.xx"
                            }'
          defaultgitAccount: '{
                                "artifactAccount": "my-github-artifact-account",
                                "reference": "https://api.github.com/repos/opsmx/Pf4jCustomStagePlugin/contents/script.sh",
                                "type": "github/file",
                                "version": "main"
                              }'
```
          2.   Echo configuration
Adding the following to your echo.yml or ~/.hal/default/profiles/echo-local.yml config will load and start the latest CustomStage plugin during app startup.
```
spinnaker:
  extensibility:
    plugins:
      Opsmx.CustomStagePlugin:
        enabled: true
        version: 1.0.1
```   
   - [x] Restart the microservices.

###### **NOTE: ** `Method 2 cannot be used for deploying ` **DECK** `plugin.`

## Check the logs to confirm the plugins started successfully:

   #### Echo logs
```
2021-03-12 07:41:03.578  INFO 15021 --- [           main] c.n.s.config.PluginsAutoConfiguration    : Enabling spinnaker-official and spinnaker-community plugin repositories
2021-03-12 07:41:03.725  INFO 15021 --- [           main] org.pf4j.AbstractPluginManager           : Plugin 'Opsmx.CustomStagePlugin@1.0.2' resolved
2021-03-12 07:41:05.148  INFO 15021 --- [           main] org.pf4j.AbstractPluginManager           : Start plugin 'Opsmx.CustomStagePlugin@1.0.2'
2021-03-12 07:41:05.157  INFO 15021 --- [           main] c.o.s.echo.plugins.CustomEchoPlugin      : CustomEchoPlugin.start()
```
   #### Orca logs
```
2021-03-12 07:43:02.827  INFO 15527 --- [           main] org.pf4j.AbstractPluginManager           : [] No plugins
2021-03-12 07:43:04.472  INFO 15527 --- [           main] org.pf4j.util.FileUtils                  : [] Expanded plugin zip 'Opsmx.CustomStagePlugin-pf4jCustomStagePlugin-v1.0.1.zip' in 'Opsmx.CustomStagePlugin-pf4jCustomStagePlugin-v1.0.1'
2021-03-12 07:43:04.490  INFO 15527 --- [           main] org.pf4j.util.FileUtils                  : [] Expanded plugin zip 'orca.zip' in 'orca'
2021-03-12 07:43:04.508  INFO 15527 --- [           main] org.pf4j.AbstractPluginManager           : [] Plugin 'Opsmx.CustomStagePlugin@1.0.2' resolved
2021-03-12 07:43:04.509  INFO 15527 --- [           main] org.pf4j.AbstractPluginManager           : [] Start plugin 'Opsmx.CustomStagePlugin@1.0.2'
2021-03-12 07:43:04.517  INFO 15527 --- [           main] c.o.p.stage.custom.CustomStagePlugin     : [] CustomStagePlugin.start()
```
#### Deck logs
```
2021-03-12 07:51:24.117  INFO 16634 --- [TaskScheduler-3] c.n.s.gate.plugins.deck.DeckPluginCache  : Downloading plugin 'Opsmx.CustomStagePlugin@1.0.1'
2021-03-12 07:51:24.481  INFO 16634 --- [TaskScheduler-3] org.pf4j.util.FileUtils                  : Expanded plugin zip 'pf4jCustomStagePlugin-v1.0.1.zip' in 'pf4jCustomStagePlugin-v1.0.1'
2021-03-12 07:51:24.482  INFO 16634 --- [TaskScheduler-3] org.pf4j.util.FileUtils                  : Expanded plugin zip 'deck.zip' in 'deck'
2021-03-12 07:51:24.482  INFO 16634 --- [TaskScheduler-3] c.n.s.gate.plugins.deck.DeckPluginCache  : Adding plugin 'Opsmx.CustomStagePlugin@1.0.1' to local cache: /tmp/downloaded-plugin-cache12282751100144509192/Opsmx.CustomStagePlugin/1.0.1
2021-03-12 07:51:24.490  INFO 16634 --- [TaskScheduler-3] c.n.s.gate.plugins.deck.DeckPluginCache  : Cached 1 deck plugins
```

## Common pitfalls:

     1. Check the plugin id in the code with service.yml configuration. Ensure that both the plugin id's are the same.
    
     2. Check the plugin version in the code with service.yml configuration. Ensure that both the versions are the same.
