#[derive(Default,)]
pub struct AppState {
    server_handle: Option<tauri::async_runtime::JoinHandle<(),>,>,
}

impl AppState {
    pub(crate) fn set_handle(&mut self, handle: tauri::async_runtime::JoinHandle<(),>,) {
        self.server_handle = Some(handle,);
    }

    pub(crate) fn stop_server(&mut self,) {
        if let Some(handle,) = self.server_handle.take() {
            handle.abort();
        }
    }
}
