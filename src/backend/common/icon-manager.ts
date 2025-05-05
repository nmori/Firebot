import frontendCommunicator from "./frontend-communicator";
import { FontAwesomeIcon } from "../../shared/types";
import logger from "../logwrapper";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import profileManager from "./profile-manager";

enum FontAwesomeStyle {
    Brands = "brands",
    Regular = "regular",
    Solid = "solid",
    Light = "light",
    Duotone = "duotone"
}

interface FontAwesomeIconSVG {
    last_modified: number;
    raw: string;
    viewBox: string[];
    width: number;
    height: number;
    path: string;
}

interface FontAwesomeIconDefinition {
    changes: string[];
    ligatures: string[];
    search: {
        terms: string[];
    };
    styles: FontAwesomeStyle[];
    unicode: string;
    label: string;
    voted?: boolean;
    svg: Record<keyof FontAwesomeStyle, FontAwesomeIconSVG>;
    free: FontAwesomeStyle[];
    private?: boolean;
}

type FontAwesomeIconDefinitions = {
    [iconName: string]: FontAwesomeIconDefinition
}

class IconManager {
    private readonly iconCacheFile: string;
    private readonly iconCachePath: string;
    private readonly cacheValidityDays = 7; // キャッシュの有効期間（日数）
    
    icons: FontAwesomeIcon[] = [];
    iconsLoaded = false;

    constructor() {
        this.iconCachePath = profileManager.getPathInProfile("/cache");
        this.iconCacheFile = path.join(this.iconCachePath, "font-awesome-icons.json");
        
        // キャッシュディレクトリが存在しない場合は作成
        if (!fs.existsSync(this.iconCachePath)) {
            try {
                fs.mkdirSync(this.iconCachePath, { recursive: true });
            } catch (error) {
                logger.error("アイコンキャッシュディレクトリの作成に失敗しました", error);
            }
        }
        
        frontendCommunicator.on("all-font-awesome-icons", () => this.icons);
    }
    
    // キャッシュの有効性チェック（7日以内に更新されているか）
    private isCacheValid(): boolean {
        try {
            if (!fs.existsSync(this.iconCacheFile)) {
                return false;
            }
            
            const stats = fs.statSync(this.iconCacheFile);
            const modifiedTime = stats.mtime.getTime();
            const currentTime = new Date().getTime();
            const daysSinceModified = (currentTime - modifiedTime) / (1000 * 60 * 60 * 24);
            
            return daysSinceModified < this.cacheValidityDays;
        } catch (error) {
            logger.error("キャッシュ有効性チェックに失敗しました", error);
            return false;
        }
    }
    
    // キャッシュからアイコンを読み込む
    private async loadIconsFromCache(): Promise<boolean> {
        try {
            if (!this.isCacheValid()) {
                return false;
            }
            
            const cacheData = await fsp.readFile(this.iconCacheFile, 'utf8');
            this.icons = JSON.parse(cacheData);
            logger.info("Font Awesome アイコンをキャッシュから読み込みました");
            this.iconsLoaded = true;
            return true;
        } catch (error) {
            logger.error("キャッシュからのアイコン読み込みに失敗しました", error);
            return false;
        }
    }
    
    // アイコンをキャッシュに保存
    private async saveIconsToCache(): Promise<void> {
        try {
            await fsp.writeFile(this.iconCacheFile, JSON.stringify(this.icons), 'utf8');
            logger.info("Font Awesome アイコンをキャッシュに保存しました");
        } catch (error) {
            logger.error("アイコンキャッシュの保存に失敗しました", error);
        }
    }
    
    // オンラインからアイコンを取得
    private async fetchIconsFromOnline(): Promise<FontAwesomeIconDefinitions | null> {
        try {
            logger.info("Font Awesome アイコンをオンラインから取得しています...");
            const response = await fetch("https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/metadata/icons.json");
            
            if (!response.ok) {
                throw new Error(`HTTP エラー: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            logger.error("オンラインからのアイコン取得に失敗しました", error);
            return null;
        }
    }
    
    // アイコンを処理して内部形式に変換
    private processIcons(fontAwesomeIcons: FontAwesomeIconDefinitions): void {
        this.icons = [];
        const styles = ["Solid", "Regular", "Light", "Duotone"];
        
        for (const iconName in fontAwesomeIcons) {
            if (fontAwesomeIcons[iconName].private) {
                delete fontAwesomeIcons[iconName];
            }
        }
        
        Object.entries(fontAwesomeIcons).forEach(([name, data]) => {
            if (data.free.includes(FontAwesomeStyle.Brands)) {
                this.icons.push({
                    name: `${name.replace("-", " ")}`,
                    className: `fab fa-${name}`,
                    style: "Brands",
                    searchTerms: data.search.terms
                });
            } else {
                this.icons.push(...styles.map((style) => {
                    return {
                        name: `${name.replace("-", " ")}`,
                        className: `fa${style.charAt(0).toLowerCase()} fa-${name}`,
                        style: style,
                        searchTerms: data.search.terms
                    };
                }));
            }
        });
        
        this.iconsLoaded = true;
    }

    async loadFontAwesomeIcons(): Promise<void> {
        // まずキャッシュから読み込みを試みる
        const cacheLoaded = await this.loadIconsFromCache();
        
        if (cacheLoaded) {
            // キャッシュから読み込めた場合は、バックグラウンドで更新処理を行う
            setTimeout(async () => {
                await this.updateIconsInBackground();
            }, 30000); // 30秒後に更新処理を実行
            return;
        }
        
        // キャッシュから読み込めなかった場合はオンラインから取得
        const fontAwesomeIcons = await this.fetchIconsFromOnline();
        
        if (fontAwesomeIcons) {
            this.processIcons(fontAwesomeIcons);
            await this.saveIconsToCache();
        } else {
            // オンラインからも取得できなかった場合は空の配列をセット
            logger.warn("Font Awesome アイコン情報を取得できませんでした。空のリストを使用します。");
            this.icons = [];
            this.iconsLoaded = true;
        }
    }
    
    // バックグラウンドでアイコン情報を更新
    private async updateIconsInBackground(): Promise<void> {
        try {
            if (this.isCacheValid()) {
                return; // キャッシュが有効ならスキップ
            }
            
            const fontAwesomeIcons = await this.fetchIconsFromOnline();
            
            if (fontAwesomeIcons) {
                this.processIcons(fontAwesomeIcons);
                await this.saveIconsToCache();
                logger.info("Font Awesome アイコンをバックグラウンドで更新しました");
            }
        } catch (error) {
            logger.error("バックグラウンドでのアイコン更新に失敗しました", error);
        }
    }
}

const iconManager = new IconManager();

export { iconManager as IconManager };
