const data = [
  {
    id: "dasbor",
    icon: "simple-icon-home",
    label: "menu.dashboards",
    permissions: ['dashboard.general.view'],
    to: "/app/dashboard",
  },

  /*
  COD
  1. Transfer Kredit COD
  2. Resi COD
  3. Pencairan Dana
  4. Debit COD
*/
  {
    id: "cod",
    icon: "iconsminds-financial",
    label: "menu.cod",
    permissions: ['cod.general.view'],
    subs: [
      {
        id: "receipt-of-funds",
        icon: "iconsminds-folder",
        label: "menu.receipt-of-funds",
        permissions: ['cod.transfer_credit.view'],
        to: "/app/receipt-of-funds",
      },
      {
        id: "cod-receipt-number",
        icon: "iconsminds-newspaper",
        label: "menu.cod-receipt-number",
        permissions: ['cod.transfer_credit.view'],
        to: "/app/cod-receipt-number",
      },
      // {
      //   id: "debit-cod",
      //   icon: "iconsminds-wallet",
      //   label: "Debit COD",
      //   to: "/app/debit-cod/",
      // },
    ]
  },

  /*
    Wallet
    1. Tenants Bank
    2. Wallet Transactions
  */
  {
    id: "monitoring-pickup",
    icon: "simple-icon-eye",
    label: "menu.monitoring-pickup",
    to: "/app/monitoring-pickup",
    permissions: ['tenant.pickup_monitoring.view'],
  },



  /*
    Wallet
    1. Tenants Bank
    2. Wallet Transactions
  */
  {
    id: "wallet",
    icon: "simple-icon-wallet",
    label: "menu.wallet",
    permissions: ['wallet.general.view'],
    subs: [
      {
        id: "tenants-bank",
        icon: "iconsminds-credit-card",
        label: "Tenants Bank",
        permissions: ['wallet.tenant_bank.view'],
        to: "/app/tenants-bank",
      },
      {
        id: "wallet-transactions",
        icon: "iconsminds-wallet",
        label: "menu.wallet-transactions",
        permissions: ['wallet.tenant_wallet.view'],
        to: "/app/wallet-transactions",
      },
      {
        id: "request-withdraw-funds",
        icon: "iconsminds-money-bag",
        label: "menu.request-withdraw-funds",
        permissions: ['wallet.withdrawal.view'],
        to: "/app/request-withdraw-funds/",
      }, {
        id: "withdraw-of-tenant-funds",
        icon: "iconsminds-wallet",
        label: "menu.withdraw-of-tenant-funds",
        permissions: ['wallet.withdrawal_history.view'],
        to: "/app/withdraw-of-tenant-funds/",
      }, {
        id: "debit-cod",
        icon: "iconsminds-wallet",
        label: "Histori Pencairan",
        permissions: ['wallet.withdrawal_history.view'],
        to: "/app/debit-cod/",
      },
    ]
  },

  /*
    Tenants
    1. Tenants
    2. Subscriptions
    3. List Transaksi
  */
  {
    id: "tenants",
    icon: "simple-icon-people",
    label: "menu.tenants",
    permissions: ['tenant.general.view'],
    subs: [
      {
        id: "tenants",
        icon: "iconsminds-doctor",
        label: "menu.tenants",
        permissions: ['tenant.tenant_list.view'],
        to: "/app/tenants",
      },
      {
        id: "billing",
        icon: "iconsminds-shop-4",
        label: "menu.billing",
        permissions: ['tenant.subscription.view'],
        to: "/app/billing",
      },
      {
        id: "list-transactions",
        icon: "iconsminds-receipt-4",
        label: "menu.list-transactions",
        to: "/app/list-transactions",
      },
      {
        id: "verification-request",
        icon: "iconsminds-receipt-4",
        label: "menu.verification-request",
        to: "/app/verification-request",
      },
    ]
  },
  {
    id: "users-admin",
    icon: "simple-icon-user",
    label: "menu.users",
    permissions: ['admin.general.view'],
    // to: "/app/receipt-of-funds",
    subs: [
      {
        id: "user",
        icon: "iconsminds-administrator",
        permissions: ['admin.user_admin.view'],
        label: "menu.users",
        to: "/app/users",
      },
      {
        id: "roles",
        icon: "iconsminds-unlock-2",
        permissions: ['admin.role_admin.view'],
        label: "menu.roles",
        to: "/app/roles",
      },
      {
        id: "list-permissions",
        icon: "iconsminds-receipt-4",
        permissions: ['admin.permission_admin.view'],
        label: "menu.permissions",
        to: "/app/permissions",
      },
    ]
  },
  // {
  //cod-receipt-number   label: "Debit COD",
  //   to: "/app/debit-cod/",
  // },
  // {
  //   id: "wallet-transactions",
  //   icon: "simple-icon-wallet",
  //   label: "menu.wallet-transactions",
  //   to: "/app/wallet-transactions",
  // },
  // {
  //   id: "tenants",
  //   icon: "simple-icon-people",
  //   label: "menu.tenants",
  //   to: "/app/tenants",
  // },
  // {
  //   id: "billing",
  //   icon: "iconsminds-shop-4",
  //   label: "menu.billing",
  //   to: "/app/billing",
  // },
  // {
  //   id: "list-transactions",
  //   icon: "simple-icon-book-open",
  //   label: "menu.list-transactions",
  //   to: "/app/list-transactions",
  // },
  // {
  //   id: "pages",
  //   icon: "iconsminds-digital-drawing",
  //   label: "menu.pages",
  //   to: "/app/pages",
  //   subs: [
  //     {
  //       icon: "simple-icon-credit-card",
  //       label: "menu.data-list",
  //       to: "/app/pages/data-list"
  //     },
  //     {
  //       icon: "simple-icon-list",
  //       label: "menu.thumb-list",
  //       to: "/app/pages/thumb-list"
  //     },
  //     {
  //       icon: "simple-icon-grid",
  //       label: "menu.image-list",
  //       to: "/app/pages/image-list"
  //     },
  //     {
  //       icon: "simple-icon-book-open",
  //       label: "menu.details",
  //       to: "/app/pages/details"
  //     },
  //     {
  //       icon: "simple-icon-magnifier",
  //       label: "menu.search",
  //       to: "/app/pages/search"
  //     },
  //     {
  //       icon: "simple-icon-envelope-open",
  //       label: "menu.mailing",
  //       to: "/app/pages/mailing"
  //     },
  //     {
  //       icon: "simple-icon-bag",
  //       label: "menu.invoice",
  //       to: "/app/pages/invoice"
  //     },
  //     {
  //       icon: "simple-icon-user-following",
  //       label: "menu.login",
  //       to: "/user/login",
  //       newWindow: true
  //     },
  //     {
  //       icon: "simple-icon-user-follow",
  //       label: "menu.register",
  //       to: "/user/register",
  //       newWindow: true
  //     },
  //     {
  //       icon: "simple-icon-user-following",
  //       label: "menu.forgot-password",
  //       to: "/user/forgot-password",
  //       newWindow: true
  //     },
  //     {
  //       icon: "simple-icon-exclamation",
  //       label: "menu.error",
  //       to: "/error",
  //       newWindow: true
  //     }
  //   ]
  // },
  // {
  //   id: "applications",
  //   icon: "iconsminds-air-balloon-1",
  //   label: "menu.applications",
  //   to: "/app/applications",
  //   subs: [
  //     {
  //       icon: "simple-icon-check",
  //       label: "menu.todo",
  //       to: "/app/applications/todo"
  //     },
  //     {
  //       icon: "simple-icon-calculator",
  //       label: "menu.survey",
  //       to: "/app/applications/survey"
  //     },
  //     {
  //       icon: "simple-icon-bubbles",
  //       label: "menu.chat",
  //       to: "/app/applications/chat"
  //     }
  //   ]
  // },
  // {
  //   id: "ui",
  //   icon: "iconsminds-pantone",
  //   label: "menu.ui",
  //   to: "/app/ui",
  //   subs: [
  //     { icon: "simple-icon-bell", label: "menu.alerts", to: "/app/ui/alerts" },
  //     { icon: "simple-icon-badge", label: "menu.badges", to: "/app/ui/badges" },
  //     {
  //       icon: "simple-icon-control-play",
  //       label: "menu.buttons",
  //       to: "/app/ui/buttons"
  //     },
  //     { icon: "simple-icon-layers", label: "menu.cards", to: "/app/ui/cards" },
  //     {
  //       icon: "simple-icon-picture",
  //       label: "menu.carousel",
  //       to: "/app/ui/carousel"
  //     },
  //     { icon: "simple-icon-chart", label: "menu.charts", to: "/app/ui/charts" },
  //     {
  //       icon: "simple-icon-arrow-up",
  //       label: "menu.collapse",
  //       to: "/app/ui/collapse"
  //     },
  //     {
  //       icon: "simple-icon-arrow-down",
  //       label: "menu.dropdowns",
  //       to: "/app/ui/dropdowns"
  //     },
  //     {
  //       icon: "simple-icon-book-open",
  //       label: "menu.editors",
  //       to: "/app/ui/editors"
  //     },
  //     {
  //       icon: "simple-icon-notebook",
  //       label: "menu.form-layouts",
  //       to: "/app/ui/form-layouts"
  //     },
  //     {
  //       icon: "simple-icon-puzzle",
  //       label: "menu.form-components",
  //       to: "/app/ui/form-components"
  //     },
  //     {
  //       icon: "simple-icon-check",
  //       label: "menu.form-validations",
  //       to: "/app/ui/form-validations"
  //     },
  //     { icon: "simple-icon-star", label: "menu.icons", to: "/app/ui/icons" },
  //     {
  //       icon: "simple-icon-note",
  //       label: "menu.input-groups",
  //       to: "/app/ui/input-groups"
  //     },
  //     {
  //       icon: "simple-icon-screen-desktop",
  //       label: "menu.jumbotron",
  //       to: "/app/ui/jumbotron"
  //     },
  //     { icon: "simple-icon-map", label: "menu.maps", to: "/app/ui/maps" },
  //     { icon: "simple-icon-docs", label: "menu.modal", to: "/app/ui/modal" },
  //     {
  //       icon: "simple-icon-cursor",
  //       label: "menu.navigation",
  //       to: "/app/ui/navigation"
  //     },
  //     {
  //       icon: "simple-icon-pin",
  //       label: "menu.popover-tooltip",
  //       to: "/app/ui/popover-tooltip"
  //     },
  //     {
  //       icon: "simple-icon-shuffle",
  //       label: "menu.sortable",
  //       to: "/app/ui/sortable"
  //     },
  //     { icon: "simple-icon-grid", label: "menu.tables", to: "/app/ui/tables" }
  //   ]
  // },
  // {
  //   id: "menu",
  //   icon: "iconsminds-three-arrow-fork",
  //   label: "menu.menu",
  //   to: "/app/menu",
  //   subs: [
  //     {
  //       icon: "simple-icon-logout",
  //       label: "menu.types",
  //       to: "/app/menu/types"
  //     },
  //     {
  //       icon: "simple-icon-layers",
  //       label: "menu.levels",
  //       to: "/app/menu/levels",
  //       subs: [
  //         {
  //           icon: "simple-icon-arrow-right",
  //           label: "menu.third-level-1",
  //           to: "/app/menu/levels/third-level-1"
  //         },
  //         {
  //           icon: "simple-icon-arrow-right",
  //           label: "menu.third-level-2",
  //           to: "/app/menu/levels/third-level-2"
  //         },
  //         {
  //           icon: "simple-icon-arrow-right",
  //           label: "menu.third-level-3",
  //           to: "/app/menu/levels/third-level-3"
  //         }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   id: "blankpage",
  //   icon: "iconsminds-bucket",
  //   label: "menu.blank-page",
  //   to: "/app/blank-page"
  // },
  // {
  //   id: "docs",
  //   icon: "iconsminds-library",
  //   label: "menu.docs",
  //   to: "https://gogo-react-docs.coloredstrategies.com/",
  //   newWindow:true
  // },
];
export default data;
