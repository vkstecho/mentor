# Man Power ↔ Mentor one-click bridge

Mentor side is ready. From **Man Power** training / skill section, open Mentor modules or paths with a single link.

## URL patterns (same origin or absolute)

Base (adjust host as deployed):

```
https://mentor.vkstech.com/mentor.html
# or relative from Man Power if co-hosted
mentor.html
```

### Open a free module

```
mentor.html?openModule=met_train
mentor.html?openModule=met_train&from=mp&mobile=98XXXXXXXX
```

Supported `openModule` ids (see `FREE_PACK_MODULES`):

| id | Module |
|----|--------|
| met_train | Met Train Pro |
| mr_skill | MR Skill |
| supskill | SupSkill |
| timestudy | Time Study |
| excel_expert | Excel Expert |
| kpi | KPI Dashboard |
| met_cost | Met Cost Pro |

### Open a learning path (highlight + scroll)

```
mentor.html?path=new_metallizer_operator
mentor.html?path=shift_incharge
mentor.html?path=process_engineer
```

Combine with Man Power auth:

```
mentor.html?from=mp&mobile=98XXXXXXXX&path=new_metallizer_operator
mentor.html?from=mp&mobile=98XXXXXXXX&openModule=met_train
```

## Suggested Man Power UI

In training / skill-matrix cells, add buttons:

- **Learn** → `?openModule=<moduleId>&from=mp&mobile=<userPhone>`
- **Path** → `?path=new_metallizer_operator&from=mp&mobile=<userPhone>`

Existing iframe / parent session detection still works (`isInsideManPower`, `parentManPowerMobile`).

## Progress & certificates

- Progress is stored on the Mentor user record (`moduleProgress`, `pathProgress`, `certificates`).
- User must be logged in (OTP or Man Power parent phone) to mark complete and get certificates.
- Certificates are printable from the module card or path card after completion.
