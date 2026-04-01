import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    'app.title': 'Restaurant Alfayda',
    'app.subtitle': 'Système de Gestion Admin',
    'nav.dashboard': 'Tableau de Bord',
    'nav.revenue': 'Recettes',
    'nav.expenses': 'Dépenses',
    'nav.tajines': 'Tajines',
    'nav.drinks': 'Boissons',
    'nav.bus': 'Chauffeurs de Bus',
    'nav.employees': 'Employés',
    'nav.attendance': 'Présence',
    'nav.planning': 'Planning',
    'nav.reports': 'Rapports',
    'nav.logout': 'Déconnexion',
    'login.title': 'Restaurant Alfayda',
    'login.subtitle': 'Système de Gestion Admin',
    'login.email': 'Adresse Email',
    'login.password': 'Mot de Passe',
    'login.button': 'Se Connecter',
    'login.error.unauthorized': 'Adresse email non autorisée.',
    'login.error.invalid': 'Identifiants invalides. Veuillez réessayer.',
    'login.error.config': 'Configuration Supabase manquante.',
    'dashboard.welcome': 'Bienvenue, Admin',
    'dashboard.daily': 'Aperçu Quotidien',
    'dashboard.monthly': 'Aperçu Mensuel',
    'dashboard.revenue': 'Recettes',
    'dashboard.expenses': 'Dépenses',
    'dashboard.profit': 'Bénéfice',
    'dashboard.chart.rev_exp': 'Recettes vs Dépenses (7 derniers jours)',
    'dashboard.chart.profit': 'Tendance du Bénéfice (7 derniers jours)',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.update': 'Mettre à jour',
    'common.date': 'Date',
    'common.actions': 'Actions',
    'common.notes': 'Notes',
    'common.total': 'Total',
    'common.amount': 'Montant',
    'common.category': 'Catégorie',
    'common.description': 'Description',
    'common.quantity': 'Quantité',
    'common.price': 'Prix',
    'common.status': 'Statut',
    'common.name': 'Nom',
    'common.role': 'Rôle',
    'common.phone': 'Téléphone',
    'common.loading': 'Chargement...',
    'common.no_data': 'Aucune donnée trouvée.',
    'common.confirm_delete': 'Êtes-vous sûr de vouloir supprimer cette entrée ?',
    'revenue.title': 'Gestion des Recettes',
    'revenue.subtitle': 'Suivez les ventes quotidiennes de nourriture, boissons et autres sources',
    'revenue.date': 'Date',
    'revenue.food': 'Recettes Nourriture',
    'revenue.drinks': 'Recettes Boissons',
    'revenue.other': 'Autres Recettes',
    'revenue.total': 'Total',
    'expense.title': 'Gestion des Dépenses',
    'expense.type': 'Type',
    'expense.daily': 'Quotidien',
    'expense.monthly': 'Mensuel',
    'tajine.title': 'Gestion des Tajines',
    'tajine.prepared': 'Préparés',
    'tajine.sold': 'Vendus',
    'tajine.remaining': 'Restants',
    'drink.title': 'Ventes de Boissons',
    'drink.server': 'Serveur',
    'drink.name': 'Nom de la Boisson',
    'bus.title': 'Repas Chauffeurs de Bus',
    'bus.count': 'Nombre de Chauffeurs',
    'bus.meal': 'Type de Repas',
    'bus.cost': 'Coût Estimé',
    'employee.title': 'Gestion des Employés',
    'attendance.title': 'Présence & Salaire',
    'attendance.mark': 'Marquer la Présence',
    'attendance.present': 'Présent',
    'attendance.absent': 'Absent',
    'attendance.salary': 'Salaire Quotidien',
    'planning.title': 'Planning (Horaires)',
    'planning.shift': 'Équipe',
    'planning.add': 'Ajouter une Équipe',
    'report.title': 'Rapports Financiers',
    'report.export_pdf': 'Exporter PDF',
    'report.export_excel': 'Exporter Excel',
    'report.period': 'Période',
  },
  ar: {
    'app.title': 'مطعم الفائدة',
    'app.subtitle': 'نظام إدارة المشرف',
    'nav.dashboard': 'لوحة القيادة',
    'nav.revenue': 'المداخيل',
    'nav.expenses': 'المصاريف',
    'nav.tajines': 'الطواجن',
    'nav.drinks': 'المشروبات',
    'nav.bus': 'سائقو الحافلات',
    'nav.employees': 'الموظفون',
    'nav.attendance': 'الحضور',
    'nav.planning': 'التخطيط',
    'nav.reports': 'التقارير',
    'nav.logout': 'تسجيل الخروج',
    'login.title': 'مطعم الفائدة',
    'login.subtitle': 'نظام إدارة المشرف',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.button': 'تسجيل الدخول',
    'login.error.unauthorized': 'البريد الإلكتروني غير مصرح به.',
    'login.error.invalid': 'بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.',
    'login.error.config': 'تكوين Supabase مفقود.',
    'dashboard.welcome': 'مرحباً بك، أيها المشرف',
    'dashboard.daily': 'نظرة عامة يومية',
    'dashboard.monthly': 'نظرة عامة شهرية',
    'dashboard.revenue': 'المداخيل',
    'dashboard.expenses': 'المصاريف',
    'dashboard.profit': 'الربح',
    'dashboard.chart.rev_exp': 'المداخيل مقابل المصاريف (آخر 7 أيام)',
    'dashboard.chart.profit': 'اتجاه الربح (آخر 7 أيام)',
    'common.add': 'إضافة',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.update': 'تحديث',
    'common.date': 'التاريخ',
    'common.actions': 'الإجراءات',
    'common.notes': 'ملاحظات',
    'common.total': 'المجموع',
    'common.amount': 'المبلغ',
    'common.category': 'الفئة',
    'common.description': 'الوصف',
    'common.quantity': 'الكمية',
    'common.price': 'السعر',
    'common.status': 'الحالة',
    'common.name': 'الاسم',
    'common.role': 'الدور',
    'common.phone': 'الهاتف',
    'common.loading': 'جاري التحميل...',
    'common.no_data': 'لم يتم العثور على بيانات.',
    'common.confirm_delete': 'هل أنت متأكد أنك تريد حذف هذا الإدخال؟',
    'revenue.title': 'إدارة المداخيل',
    'revenue.subtitle': 'تتبع المبيعات اليومية من الطعام والمشروبات والمصادر الأخرى',
    'revenue.date': 'التاريخ',
    'revenue.food': 'مداخيل الطعام',
    'revenue.drinks': 'مداخيل المشروبات',
    'revenue.other': 'مداخيل أخرى',
    'revenue.total': 'المجموع',
    'expense.title': 'إدارة المصاريف',
    'expense.type': 'النوع',
    'expense.daily': 'يومي',
    'expense.monthly': 'شهري',
    'tajine.title': 'إدارة الطواجن',
    'tajine.prepared': 'المحضرة',
    'tajine.sold': 'المباعة',
    'tajine.remaining': 'المتبقية',
    'drink.title': 'مبيعات المشروبات',
    'drink.server': 'النادل',
    'drink.name': 'اسم المشروب',
    'bus.title': 'وجبات سائقي الحافلات',
    'bus.count': 'عدد السائقين',
    'bus.meal': 'نوع الوجبة',
    'bus.cost': 'التكلفة التقديرية',
    'employee.title': 'إدارة الموظفين',
    'attendance.title': 'الحضور والراتب',
    'attendance.mark': 'تسجيل الحضور',
    'attendance.present': 'حاضر',
    'attendance.absent': 'غائب',
    'attendance.salary': 'الراتب اليومي',
    'planning.title': 'التخطيط (الجدول الزمني)',
    'planning.shift': 'المناوبة',
    'planning.add': 'إضافة مناوبة',
    'report.title': 'التقارير المالية',
    'report.export_pdf': 'تصدير PDF',
    'report.export_excel': 'تصدير Excel',
    'report.period': 'الفترة',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as Language) || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
