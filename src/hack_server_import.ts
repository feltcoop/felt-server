// TODO temp hack to workaround Vite prebundling issue:
// https://github.com/sveltejs/kit/issues/1570
export const hack_server_import = (id: string) => import(id);
