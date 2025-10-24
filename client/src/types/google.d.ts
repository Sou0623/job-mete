/**
 * Google API関連の型定義
 */

declare namespace gapi {
  namespace client {
    function init(args: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;

    function getToken(): {access_token: string} | null;

    namespace calendar {
      namespace events {
        function insert(args: {
          calendarId: string;
          resource: {
            summary: string;
            location?: string;
            description?: string;
            start: {
              dateTime: string;
              timeZone: string;
            };
            end: {
              dateTime: string;
              timeZone: string;
            };
            reminders?: {
              useDefault: boolean;
              overrides: Array<{
                method: string;
                minutes: number;
              }>;
            };
          };
        }): Promise<{result: {id?: string}}>;

        function update(args: {
          calendarId: string;
          eventId: string;
          resource: {
            summary: string;
            location?: string;
            description?: string;
            start: {
              dateTime: string;
              timeZone: string;
            };
            end: {
              dateTime: string;
              timeZone: string;
            };
            reminders?: {
              useDefault: boolean;
              overrides: Array<{
                method: string;
                minutes: number;
              }>;
            };
          };
        }): Promise<void>;

        function delete(args: {
          calendarId: string;
          eventId: string;
        }): Promise<void>;
      }
    }
  }

  function load(
    apiName: string,
    callback: () => void
  ): void;
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        callback: (response: {
          error?: string;
          access_token?: string;
        }) => void;
        requestAccessToken(): void;
      }

      function initTokenClient(args: {
        client_id: string;
        scope: string;
        callback: () => void;
      }): TokenClient;
    }
  }
}
