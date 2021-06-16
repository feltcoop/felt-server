// TODO temp hack to workaround Vite prebundling issue:
// https://github.com/sveltejs/kit/issues/1570
// https://github.com/vitejs/vite/issues/2579
export const hack_server_import = (id: string) => import(id);
