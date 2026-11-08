// الإعدادات الحالية من نسخة Claude (أنواع الحجز، الأقسام، الحقول، الأدوار).
// بتتحط في قاعدة البيانات تلقائيًا أول مرة المالك يسجل دخول، ولو الإعدادات موجودة بالفعل الملف ده بيتجاهل.
window.SEED_CONFIG = {
  "branchName": "Makeover Obour Branch",
  "defaultRole": "viewer",
  "deptLimit": 4,
  "bookingTypes": [
    {
      "id": "install",
      "name": "فرش تفصيل",
      "needsMfg": true,
      "dept": "upholstery"
    },
    {
      "id": "mfg",
      "name": "طارة",
      "needsMfg": false,
      "dept": "upholstery"
    },
    {
      "id": "inspect",
      "name": "ارضية/ دواسة  9D",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "warranty",
      "name": "ارضية سادة",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "t6ktb4h",
      "name": "شنطة 9D",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tmw3y80",
      "name": "protection film",
      "needsMfg": false,
      "dept": "electronics"
    },
    {
      "id": "tdp6u7f",
      "name": "فيميه / عزل",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "trijudd",
      "name": "كاسيت اندرويد",
      "needsMfg": false,
      "dept": "film"
    },
    {
      "id": "tv7pq6i",
      "name": "أخرى",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tz1e4wo",
      "name": "رفع سطمبة فرش",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tuc1kcp",
      "name": "تفصيل مفرش طابلوه",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tl3j2mr",
      "name": "تركيب سقف",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tea484k",
      "name": "تركيب أبواب",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tttwdye",
      "name": "تركيب أكريلك",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tlirtip",
      "name": "تركيب سينسور بارك",
      "needsMfg": false,
      "dept": ""
    },
    {
      "id": "tepejlh",
      "name": "تركيب كسوة جاهزة",
      "needsMfg": false,
      "dept": ""
    }
  ],
  "carTypes": [],
  "customFields": [
    {
      "id": "fkc2s1i",
      "label": "رقم أمر الشغل",
      "options": [],
      "showInList": true,
      "type": "number"
    },
    {
      "id": "frpt01",
      "label": "محضر الاستلام",
      "options": [],
      "showInList": false,
      "type": "file"
    }
  ],
  "departments": [
    {
      "id": "upholstery",
      "limit": 4,
      "name": "السروجه"
    },
    {
      "id": "electronics",
      "limit": 4,
      "name": "افلام الحماية"
    },
    {
      "id": "film",
      "limit": 4,
      "name": "الكهرباء"
    },
    {
      "id": "accessories",
      "limit": 4,
      "name": "الإكسسوارات"
    }
  ],
  "receiveFlow": {
    "workOrderField": "fkc2s1i",
    "reportField": "frpt01",
    "requireReport": false
  },
  "roleOrder": [
    "admin",
    "ceo",
    "salesManager",
    "sales",
    "operation",
    "viewer"
  ],
  "roles": {
    "admin": {
      "name": "مدير النظام",
      "perms": {
        "approve": true,
        "cancel": true,
        "ceoDash": true,
        "create": true,
        "delete": true,
        "editAll": true,
        "editOwn": true,
        "export": true,
        "mfg": true,
        "settings": true,
        "status": true
      }
    },
    "ceo": {
      "name": "CEO",
      "perms": {
        "approve": true,
        "cancel": true,
        "ceoDash": true,
        "create": true,
        "delete": true,
        "editAll": true,
        "editOwn": true,
        "export": true,
        "mfg": true,
        "settings": true,
        "status": true
      }
    },
    "salesManager": {
      "name": "Sales Manager",
      "perms": {
        "approve": true,
        "cancel": true,
        "create": true,
        "editAll": true,
        "export": true
      }
    },
    "sales": {
      "name": "Sales",
      "perms": {
        "create": true
      }
    },
    "operation": {
      "name": "Operation",
      "perms": {
        "mfg": true,
        "status": true
      }
    },
    "viewer": {
      "name": "متابعة فقط",
      "perms": {}
    }
  },
  "waTemplates": [
    {
      "id": "confirm",
      "name": "تأكيد الحجز",
      "text": "أهلًا أ/ {الاسم}،\nتم تأكيد حجزك في {الفرع} يوم {اليوم} {التاريخ} الساعة {الوقت}.\nالسيارة: {السيارة}\nالخدمة: {نوع_الحجز}\nرقم الحجز: {رقم_الحجز}\nفي انتظارك."
    },
    {
      "id": "remind",
      "name": "تذكير بالميعاد",
      "text": "صباح الخير أ/ {الاسم}،\nبنفكّر حضرتك بميعادك النهارده الساعة {الوقت} في {الفرع} ({نوع_الحجز}).\nياريت تأكد حضورك بالرد على الرسالة دي.\nرقم الحجز: {رقم_الحجز}"
    },
    {
      "id": "ready",
      "name": "العربية جاهزة",
      "text": "أ/ {الاسم}،\nعربيتك {السيارة} جاهزة للاستلام من {الفرع}.\nرقم أمر الشغل: {أمر_الشغل}\nنورتنا."
    },
    {
      "id": "resched",
      "name": "تحديد ميعاد جديد",
      "text": "أهلًا أ/ {الاسم}،\nحابين نحدد ميعاد جديد لحجزك ({نوع_الحجز}) لعربية {السيارة}.\nياريت تبلغنا باليوم والوقت المناسبين لحضرتك."
    }
  ]
};
