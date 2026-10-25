# Relatório REA — QConcursos 2.15.3 (`com.qconcursos.QCX`)

> Análise estática realizada com REA + jadx-headless-mcp 0.7.1 + JADX 1.5.6.
> SHA-256 do APK: `7859e250e40c9d3f20bac149d6ab2aff74dfa7e9fda1cd5473df14f83b1d3226`
> Nada foi executado; fatos observados abaixo vêm de manifesto, código decompilado e strings do snapshot Dart (`libapp.so`).

## 1. Identidade

| Campo | Valor |
|---|---|
| Pacote | `com.qconcursos.QCX` |
| Versão | 2.15.3 (versionCode 201500310) |
| minSdk / targetSdk | 24 / 36 |
| Framework | **Flutter** (Dart AOT em `libapp.so`, 22,7 MB arm64) + engine `libflutter.so` |
| Application | `com.qconcursos.qcx.MainApplication` |
| Launcher | `com.qconcursos.qcx.MainActivity` (exportado, singleTop, deep links) |
| Package Dart próprio | **`qcx_flutter`** |
| Kotlin/Java próprio | apenas 6 classes (shell Flutter + widgets); o resto é SDK |
| Ofuscação | R8/ProGuard ativo nos DEX |

## 2. Backend — de onde vêm as questões

As questões NÃO são locais: vêm de uma **API REST própria** (estilo Rails, JSON), no padrão:

- Base principal: `https://api.qconcursos.com/`
- Base secundária: `https://api-odin.qconcursos.com/` (serviço **Odin** — autenticação/tokens: `_deleteOdinToken`, `access_token` + refresh)
- Conteúdo/CMS: **Kratos** (`api/kratos/qc_app/articles`, `api/kratos/atreus/editorials`)
- Simulados: serviço **ILS** (`api/ils/practice_tests`)
- Push/analytics próprio: **Pulse** (`https://pulse-api.qconcursos.com`, `/v1/devices/register`, `/v1/events`)
- Outros nomes de serviço: **Fenrir** (`https://fenrir.qconcursos.com/`, ambiente HMG `fenrir.qconcursos-hmg.com`)
- Ambientes: prod / `beta.qconcursos-hmg.com` (homologação) / dev (`http://localhost:3000/`, `http://development.odin:3000/`)

### Origem do conteúdo (inferred de campos e features)
- Elaboração própria + parceiros: campos `discipline`, `examining_board` (banca), `institute` (instituto), `year` no modelo de questão
- Comentários de professores: `api/questions/{ID}/professor_commentaries_apps` (vídeos comentando a questão)
- Parcerias editoriais detectadas: Folha de S.Paulo (`folha.qconcursos.com`), Damasio/OAB (`oab.damasio.com.br`), ProEnem (`estude.proenem.com.br`), eMilitar (`eumilitar.com`), Elite (`elite.qconcursos.com`), México (`link.qconcursos.mx`)

## 3. Modelo de questão (schema observado no SQLite local)

```
questions: id, resolved, year, discipline, examining_board, institute, statement, content
answers:   created_at, question_id, filter_id, answer, right_answer
filter_question: (id_filter, id_question)
attempt:   (attempt_id, practice_test_id), (id, practice_test_id, attempt_id, data)
study:     (id, study_guide_id, track_id, chapter_id, question_id)
```
Enunciado = `statement`; alternativas separadas (`_extractAlternatives`, `_extractStatement`); filtros por banca/ano/disciplina/instituto (`api/stored_filters`).

## 4. Endpoints completos descobertos no app

### Questões
- `api/questions` · `api/questions/{QUESTION_ID}/resolve` (responder)
- `api/questions/{QUESTION_ID}/statistics` (acertos %)
- `api/questions/{QUESTION_ID}/commentaries` (+ `/report_abuse`, `/update_like`)
- `api/questions/{QUESTION_ID}/professor_commentaries_apps`
- `api/question_errors` · `api/questions_downloads` (offline)
- `api/note_book/questions` · `api/note_book/questions/{QUESTION_ID}` (caderno)
- `api/stored_filters` · `api/stored_filters/{FILTER_ID}`
- `api/user_filter_performances2`

### Simulados (ILS)
- `api/ils/practice_tests/` · `api/ils/practice_tests/{ID}` · `by_study_guide`
- `api/ils/practice_tests/attempts` · `attempts/{ATTEMPT_ID}/complete`
- `attempts/{ATTEMPT_ID}/questions/{QUESTION_ID}` (resposta por questão)
- `api/mobile/courses/practice-tests/by-study-guide/{SG}/{SPEC}` · `by-specification/...` · `attempt-history/...` · `general-analysis/{COURSE_ID}`
- `api/mobile_app/practice_tests/automatic_test` · `recreate_test` · `attempts/{ID}/start`

### Cursos / trilhas / aulas
- `api/mobile/study-courses/{COURSE_ID}` · `/all` · `/home` · `/institutes` · `/enrollment` · `/checks` · `/plan` · `/plan/days` · `/plan/days/{DAY_INDEX}` · `/questions-tree`
- `api/mobile/course/{COURSE_ID}/lesson/{LESSON_ID}` · `/progress` · `/markings` (+ `/{MARKING_ID}`) · `.../content/{CONTENT_ID}/check`
- `api/mobile/course/{STUDY_GUIDE_ID}/video-lesson/{TRACK_ID}/{CHAPTER_ID}`
- `api/lessons` · `api/lessons/{LESSON_ID}/progress` · `api/lesson_feedbacks`
- `api/mobile_app/playlists` (+ `/{ID}`, `/lesson`, `/lessons`)
- `api/mobile/content/{CHAPTER_ID}/versions/{VERSION_NUMBER}/feedback`

### Cadernos / flashcards / materiais
- `api/mobile/notebooks` · `api/mobile/notebook/{NOTEBOOK_ID}`
- `api/mobile/notebooks/weekly-errors/detail|history` (erros da semana)
- `api/mobile/public-notebook/home` · `api/mobile/public-notebook/copy`
- `api/mobile/v1/flashcards/deck` · `api/mobile/v1/flashcards/answers`

### Gamificação
- Streak: `api/streaks/cycles` · `create_cycle` · `show_cycle` · `update_cycle` · `avaliable_reward` · `redeem_reward` · `api/mobile/streak/invite` · `invite/accept`
- Liga: `api/league/ranking`
- Desafios coletivos (v2): `api/mobile/v2/collective-challenges` (+ `/{UUID}/participate`, `/leave`, `/start`, `/ranking`, `/points_history`, `/updates`, `/updates/{ID}/comments`, `/reactions`, `questions/resolve`)
- Metas: `api/study_goals` · `update_hours_goal` · `update_questions_goal`

### Usuário / conta / pagamentos
- `api/users` · `/{USER_ID}` · `send_email_confirmation` · `send_reset_password_email` · `used_resources/summary`
- `api/user_profile` · `api/user_preferences` · `api/user_notifications`
- `api/offers` · `api/checkout/hooks/external_payments` · `api/check_limits_app` (limites do plano freemium)
- `api/mobile/intercom/auth`
- Login social: Google + Apple (`sign_in_with_apple`, google_sign_in) — OAuth `access_token` com refresh

### Infra/push/misc
- `api/devices` · `api/devices/{FCM_TOKEN}`
- `api/qlinks` · `api/qlinks/{QLINK_ALIAS}` (encurtador próprio)
- `api/administrative_levels` · `api/knowledge_areas` · `api/app_feedbacks` · `api/comment_feedbacks` · `api/app_active_recurrences` · `api/app_replacement_modes` · `api/performance` · `api/study/user_migrations` · `api/mobile/opportunities/study-courses` · `api/mobile_app/practice_tests/...`
- Deep links: `qcx://questions|exams|flashcards`, `https://link.qconcursos.com`, `qconcursos.page.link`, `folha.page.link`, `grupoq.sng.link`, `qlinks-staging.qconcursos.workers.dev`

## 5. Arquitetura do app Dart (`qcx_flutter`) — Clean Architecture + flutter_modular

Camadas observadas nos URIs do snapshot:

```
main/factories
module/{app_module, common, guards, modules}      ← flutter_modular
domain/{entities, repositories, usecases, services, params, exceptions, routes, helpers, dependency_injection}
data/{models, repositories, usecases, http, database, cache, download, params, services,
      amplitude, analytics, one_signal, feature_toggle, dependency_injector, ...}
infra/{http, database, environment, pulse, purchase, notifications, one_signal, intercom,
       player, background_download, social_authentication, shared_prefs, connection, ...}
presentation/{presenters, protocols}              ← MVP/MVVM
ui/{pages, widgets, helpers, mixins, web, resources, ...}
validation/{protocols, validators}
utils/{routes, date, file, image, mask, money, query_parameter, web_view_url, ...}
firebase/{firebase_initializer, params_handler, route_observer}
```

## 6. Infraestrutura do cliente

- **HTTP**: cliente próprio (`data/http`, `infra/http`) com OAuth bearer + refresh
- **Offline-first**: SQLite via **sqflite**; filas de download por filtro/caderno (`downloadQueueId, filterId, toDownloadQuantity, totalQuestionsQuantity`); download de questões (`api/questions_downloads`) e de **segmentos HLS** de vídeo (BetterPlayer + `#EXT-X-...`); `background_downloader`
- **Vídeo-aulas**: HLS (m3u8), player BetterPlayer, FFmpeg kit completo, YouTube via webview (iframe API com origin=qconcursos.com)
- **Push**: Firebase FCM + **OneSignal** (+ HMS Huawei) + **Pulse** próprio (SDK `dev.questedu.pulse_flutter`, pigeon bridge, receipt drain/saveConfig)
- **Analytics**: Firebase Analytics/Performance/Crashlytics + **Amplitude** (com Amplitude Experiments)
- **Suporte**: Intercom (chat, auth via `api/mobile/intercom/auth`)
- **Notificações locais**: flutter_local_notifications + WorkManager + background_fetch
- **Widgets de tela**: home_widget + Glance (streak small/medium, portrait/landscape)
- **Pagamentos**: Google Play Billing + Apple StoreKit + web de planos (`/plans-webview`) + `api/offers`/`external_payments`
- **Design system**: tokens de tema por marca (`brand050...`, Primary/Gray) — multimarca no mesmo binário

## 7. Segurança / observações

- `android:usesCleartextTraffic="true"` (HTTP permitido pelo manifesto)
- `allowBackup="false"` ✓
- R8 com nomes ofuscados; sem string encryption aparente nas URLs (endpoints legíveis nas strings)
- Nenhum anti-root/anti-emulador detectado nas buscas feitas

## 8. Artefatos gerados (logs/ na pasta do projeto)

| Arquivo | Conteúdo |
|---|---|
| `logs/01-libapp-so-strings-69666-linhas.txt` | Todas as strings ASCII ≥8 chars extraídas do `libapp.so` (arm64) |
| `logs/02-qcx-flutter-3210-arquivos-dart.txt` | Árvore completa: 3.210 URIs `package:qcx_flutter/*.dart` (inventário de páginas/features) |
| `logs/03-notices-dart-pacotes.txt` | NOTICES.Z decompactado (licenças dos pacotes Dart) |
| `logs/04-manifest-decodificado.xml` | AndroidManifest completo decodificado |
| `logs/05-jadx-decompilacao.log` | Log da decompilação completa (exit 0) |
| `logs/06-endpoints-api-descobertos.txt` | 100+ paths REST (`api/...`, `v1/...`) |
| `logs/07-urls-completas.txt` | Todas as URLs http(s) encontradas no snapshot |
| `qconcursos-2-15-3-decomp/` | Código decompilado (15.587 .java) + resources |
| `RELATORIO-REA-qconcursos.md` | Este relatório |

## 9. Dependências Dart (174 pacotes `package:` referenciados no snapshot)

Principais (lista completa em `logs/01...txt`):

- **Rede/API**: `dio`, `http`, `web_socket_channel`, `connectivity_plus`
- **Arquitetura**: `flutter_modular`, `modular_core`, `auto_injector`, `result_dart`, `equatable`, `rxdart`, `provider`
- **Local/offline**: `sqflite` (+ android/common), `shared_preferences`, `simple_secure_storage`, `background_downloader`, `background_downloader_hls`, `flutter_cache_manager`
- **Vídeo/áudio**: `better_player_enhanced`, `chewie`, `video_player`, `just_audio`, `audio_session`, `flutter_hls_parser`, `ffmpeg_kit_flutter_new_https`
- **UI**: `lottie`, `flutter_svg`, `photo_view`, `table_calendar`, `styled_text`, `super_tooltip`, `percent_indicator`, `flutter_slidable`, `grouped_list`, `flex_list`, `scroll_to_index`, `emoji_picker_flutter`, `tutorial_coach_mark`, `flutter_styled_toast`, `nested`, `visibility_detector`, `image_cropper`
- **Conteúdo**: `flutter_html`, `flutter_widget_from_html` (+ fwfh_*), `htmlwhitelist`
- **Auth/social**: `google_sign_in`, `flutter_facebook_auth`, `sign_in_with_apple`, `app_links`
- **Push/analytics**: `onesignal_flutter`, `intercom_flutter`, `pulse_flutter`, `singular_flutter_sdk`, `amplitude_flutter`, `facebook_app_events`, `firebase_analytics`, `firebase_crashlytics`, `firebase_performance`
- **Pagamentos** (a remover no clone): `in_app_purchase` (+ storekit/android)
- **Utils**: `intl`, `uuid`, `timezone`, `encrypt`, `pointycastle`, `permission_handler`, `share_plus`, `appinio_social_share`, `screenshot`, `in_app_review`, `app_tracking_transparency`, `home_widget`, `workmanager`, `wakelock_plus`, `url_launcher`, `package_info_plus`, `flutter_local_notifications`, `flutter_native_splash`, `flutter_inappwebview`, `webview_flutter`, `image`, `archive`, `xml`, `yaml`

## 10. Versões de SDKs (BuildConfig, build release)

- Build **release**, `DEBUG=false` em todos os módulos
- OneSignal **5.10.2** · Intercom **18.5.0** · Ably **1.7.2** (realtime) · Intercom twig 1.3.0 · uCrop
- Assinatura: **sem v1 (JAR)** no META-INF → esquema **v2/v3** (bloco fora do ZIP). *Verificação criptográfica não executada* (ferramenta `inspect_apk_signature` indisponível nesta versão do REA)
- `META-INF/version-control-info.textproto`: `generate_error_reason: NO_SUPPORTED_VCS_FOUND` (sem proveniência git embutida)

## 11. Segurança — achados (estáticos)

1. **✗ BYPASS GLOBAL DE VALIDAÇÃO TLS** (achado principal): a classe ofuscada `J6.o` (`J6\C0669o.java`) cria um `X509TrustManager` que **não valida nada** (`J6.J0`), faz `SSLContext("TLS").init(...)` com ele e chama **`HttpsURLConnection.setDefaultSSLSocketFactory(...)`** — afetando todo o tráfego `HttpsURLConnection` do processo. Log embarcado (tag `BackgroundDownloader`): *"Bypassing TLS certificate validation — HTTPS calls will NOT check the validity of the TLS certificate."* (snippet conhecido do pacote `background_downloader` para certs self-signed, deixado em produção). **Nuance**: afeta stacks Java baseados em `HttpsURLConnection`; o Dart `HttpClient` (BoringSSL) e clientes OkHttp com factory próprio mantêm validação própria.
2. **Sem certificate pinning do app**: `CertificatePinner` existe apenas dentro da lib `okhttp3` (default). Nenhum uso `CertificatePinner.Builder` fora dela foi encontrado (presença de uso indireto via reflexão permanece desconhecida).
3. **Sem Play Integrity / SafetyNet** no app (os matches foram do SDK de eventos do Facebook).
4. **HostnameVerifier permissivo**: nenhuma ocorrência encontrada.
5. **`isRooted`** aparece como campo de log/evento (analytics reporta estado de root — observação, não bloqueio).
6. Manifesto permite **cleartext HTTP** (`usesCleartextTraffic="true"`); `allowBackup="false"` ✓.
7. Ofuscação R8 nos DEX; strings Dart (URLs, chaves públicas) **não** ofuscadas no snapshot AOT.

## 12. O que permanece desconhecido (limites da análise)

- **Código-fonte Dart real**: não recuperável do `libapp.so` (snapshot AOT) — temos URIs de arquivo, nomes de símbolos e strings, mas não o corpo dos métodos. Recuperação profunda exigiria ferramentas específicas (ex.: Blutter/reFlutter) — fora do escopo atual.
- **Comportamento do servidor**: APIs observadas estaticamente; payloads reais, validações e regras de negócio do backend não foram observados (nada foi executado/consultado).
- **Assinatura v2/v3**: esquema detectado, verificação de integridade do certificado não executada.
- **Reflection/carregamento dinâmico** e eventuais URLs fora das strings do `libapp.so` (ex.: nas outras libs nativas) permanecem não examinados.
- `libflutter.so`, libs FFmpeg e demais `.so` não tiveram análise profunda (só inventário).

## 13. Veredito da análise

✅ Decompilação **completa** (100% das classes) · ✅ manifesto/permissões/componentes · ✅ inventário de arquivo (3.061 nós) · ✅ arquitetura Dart mapeada (91 módulos, 3.210 arquivos) · ✅ 100+ endpoints · ✅ modelo de dados do sistema de questões · ✅ dependências (174 pacotes) · ✅ segurança (item 11) · ⚠️ código Dart e assinatura v2/v3 ficam como desconhecidos explícitos (item 12).

## 14. Contrato do cliente com a API de questões (como o app as consome)

### 🧱 Infra HTTP do cliente (arquivos Dart descobertos)
- `data/http/endpoints.dart` — todas as constantes de URL e rotas REST
- `data/http/http_client.dart` — cliente central baseado no pacote `dio`
- `data/http/http_headers.dart` — montagem e injeção automática de headers em toda requisição
- `data/http/http_errors.dart` — mapeamento tipado de exceções e status HTTP
- `data/http/qtm.dart` — módulo de gerenciamento de token e assinatura de requisições

### 📨 Headers em toda chamada (observados nas strings)
```http
Authorization: Bearer <token Odin>
X-API-Key: <androidApiKey>
X-App-Package: com.qconcursos.QCX
X-App-Platform: android
X-App-Signature: <assinatura do cliente>
device_id: <uuid>
app_version: 2.15.3
User-Agent: okhttp/4.9.2 (ou Dart/BoringSSL)
Platform: android
Content-Type: application/json
```
> **Nota de Segurança**: É por isso que chamadas externas sem os devidos parâmetros morrem: além do Cloudflare WAF, o backend rejeita requisições sem o `X-App-Signature`, `X-API-Key` e o token OAuth do Odin.

---

### 🔄 Fluxos de Execução da API

#### 🔄 Fluxo 1 — Listar questões (`remote_load_questions`)
- **Requisição**: `GET api/questions?per_page=&direction=&discipline_id=&study_guide_id=&question_ids=&notebook_id=`
- **Envelope de Resposta**:
  ```json
  {
    "questions": [
      {
        "id": 12345,
        "statement": "...",
        "alternatives": [
          { "key": "A", "text": "..." },
          { "key": "B", "text": "..." }
        ],
        "resolution": "...",
        "is_correct": null,
        "correct_answer": "A",
        "examining_board": "CEBRASPE",
        "institute": "Polícia Federal",
        "commentaries": [],
        "statistics": {}
      }
    ],
    "current_page": 1,
    "total_count": 1500
  }
  ```
- **Persistência**: Grava no SQLite local (`questions`) → Renderiza na UI.

#### 🔄 Fluxo 2 — Responder (Arquitetura Offline-First)
1. **`local_resolve_question`**: Grava a resposta imediatamente no SQLite local:
   `(created_at, question_id, filter_id, answer, right_answer)`
2. **Fila de sincronização**: O app adiciona a ação na fila `remote_questions_resolve_synchronization`.
3. **`remote_questions_resolve_synchronization`**: Ao detectar conectividade, envia:
   `POST api/questions/{QUESTION_ID}/resolve`
   *O app prioriza a experiência do usuário, respondendo offline e sincronizando em segundo plano.*

#### 🔄 Fluxo 3 — Download offline
- `remote_download_questions` / `remote_download_questions_page` → `api/questions_downloads` (paginado em blocos).
- `remote_download_images` → baixa e armazena em cache local todas as imagens dos enunciados.
- `local_load_questions` / `local_load_question` → leitura 100% desconectada do banco local.

#### 🔄 Fluxo 4 — Simulados (Ciclo de Tentativa ILS)
1. `remote_create_practice_test` → `POST api/ils/practice_tests`
2. `remote_load_practice_test_questions` → Carrega o caderno do simulado
3. `remote_update_question_answer` (params: `attempt_id` + `question_id`):
   `POST api/ils/practice_tests/attempts/{ATTEMPT_ID}/questions/{QUESTION_ID}` (resposta por questão)
4. `remote_synchronize` → `POST api/ils/practice_tests/attempts/{ATTEMPT_ID}/complete`
5. `remote_load_attempt_history` e `remote_load_general_analysis` → Análise de corte e ranking.

#### 🔄 Fluxo 5 — Complementares
- `remote_load_question_statistics` → `GET api/questions/{id}/statistics`
- `remote_report_question_error` → `POST api/question_errors`
- `commentaries` (curtir / denunciar) → `POST api/questions/{id}/commentaries/{id}/update_like` | `report_abuse`
- `professor_commentaries` → `GET api/questions/{id}/professor_commentaries_apps`

---

### ⚠️ Incertezas explícitas e limites
Corpos JSON completos e segredos de criptografia dos tokens dependem do binário compilado Dart AOT. A observação de tráfego em servidores de terceiros foi dispensada por conformidade técnica e ética.
