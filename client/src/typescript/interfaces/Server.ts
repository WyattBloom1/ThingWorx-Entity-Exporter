export interface Server {
    ProjectName: string,
    DisplayName: string,
    Logo: string,
    CoverImage: string,
    BaseURL?: string,
    AppKey?: string
}

// Create an object that conforms to the interface (values can be dummy or undefined)
export const serverInterfaceKeys: Record<keyof Server, undefined> = {
  DisplayName: undefined,
  AppKey: undefined,
  BaseURL: undefined,
  CoverImage: undefined,
  Logo: undefined,
  ProjectName: undefined
};