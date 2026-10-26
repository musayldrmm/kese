# Kese — Borç ve Ödeme Takibi

Kese, iPhone'da Ana Ekrana Eklenebilen (PWA), tamamen cihazda çalışan bir borç takip uygulamasıdır. Kredi kartları, taksitli ödemeler ve kira/fatura gibi düzenli ödemeler tek yerde takip edilir. Veriler tarayıcının yerel depolamasında kalır; hesap veya sunucu gerekmez.

## Gizlilik ve GitHub Pages

GitHub Pages yalnızca uygulamanın **kodunu** yayınlar: `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest` ve simgeler. Girdiğin borç tutarları, kart bilgileri ve ödeme kayıtları bu dosyaların içinde değildir.

Tutarlar her cihazın tarayıcısında `localStorage` içinde tutulur. Senin iPhone'unda girdiğin veriler GitHub'a veya başka bir sunucuya yüklenmez. Uygulamanın adresini açan başka biri kendi tarayıcısında **boş bir Kese** görür; senin kayıtlarını göremez. Verilerin görünmesi için:

- Yedek dosyasını (`kese-yedek-*.json`) repoya yüklemen,
- Telefonunu kilitsiz olarak başkasına vermen,
- İleride veri senkronizasyonu olan bir sunucu eklenmesi

gerekir. Yedek dosyaları repoya eklenmesin diye `.gitignore` içinde hariç tutuldu.

## Hızlı deneme (aynı Wi-Fi)

Bilgisayarda:

```bash
cd /home/musa/mobilapp
python3 -m http.server 4173 --bind 0.0.0.0
```

Bilgisayarın yerel IP adresini bul:

```bash
hostname -I
```

iPhone'da **Safari** ile şu adresi aç (IP'yi kendi bilgisayarınınkiyle değiştir):

```text
http://192.168.1.107:4173
```

> Bu yöntem yalnızca hızlı önizleme içindir. iPhone'da service worker, çevrimdışı çalışma ve bildirimler için **HTTPS** gerekir. Bu yüzden kalıcı kullanım için aşağıdaki yöntemlerden birini seç.

## iPhone'a kalıcı kurulum

### Seçenek 1 — Netlify Drop (en kolay)

1. Bilgisayarda tarayıcıda <https://app.netlify.com/drop> adresini aç.
2. `/home/musa/mobilapp` klasörünü sayfaya sürükle bırak.
3. Netlify'ın verdiği `https://....netlify.app` adresini iPhone'da **Safari** ile aç.
4. Alttaki **Paylaş** düğmesine dokun.
5. **Ana Ekrana Ekle** seçeneğini seç.
6. Kese'yi ana ekrandaki simgeden aç. Artık tam ekran ve çevrimdışı çalışır.

Siteyi kalıcı tutmak için Netlify'da ücretsiz hesap açıp siteyi sahiplenmen gerekir.

### Seçenek 2 — GitHub Pages

1. GitHub'da yeni bir depo (repository) oluştur.
2. `mobilapp` klasörünün içindeki dosyaları depoya yükle.
3. Depo **Settings → Pages** bölümünde **Deploy from a branch** seç.
4. Branch olarak `main`, klasör olarak `/ (root)` seç ve kaydet.
5. Verilen `https://kullanıcıadı.github.io/depo-adı/` adresini iPhone Safari'de aç.
6. **Paylaş → Ana Ekrana Ekle** ile kur.

### Seçenek 3 — Geçici HTTPS tüneli

Bilgisayarda sunucu çalışırken:

```bash
npx localtunnel --port 4173
```

Komutun verdiği `https://....loca.lt` adresini iPhone Safari'de aç. Bu yöntem geçicidir; bilgisayar ve tünel açık kaldığı sürece çalışır.

## Bildirimler

Kese iki türlü hatırlatma sunar:

1. **Sistem bildirimleri** — Ayarlar → Bildirimler → **Sistem bildirimleri** anahtarını aç. iPhone izin ister. Ödeme veya ekstre gününde, Kese açıkken/ön plandayken bildirim gönderilir.
2. **Takvim hatırlatmaları** — Ayarlar → **Takvime hatırlatma ekle** ile `.ics` dosyası indir. Dosyayı iPhone'da açıp Takvim'e ekle. Takvim, ödeme/ekstre gününde saat 09:00'da bildirim verir. Uygulama kapalıyken de çalışır.

### Hangi kayıt için bildirim geleceğini seçme

- **Genel aç/kapat:** Ayarlar → Bildirimler → Sistem bildirimleri.
- **Tür seçimi:** Ekstre kesim günü ve ödeme günü ayrı ayrı açılıp kapatılabilir.
- **Kayıt bazlı seçim:** Bir karta, taksite veya düzenli ödemeye dokun → **Bildirim** anahtarını aç/kapat.

### iOS sınırlaması

Apple, web uygulamalarının uygulama kapalıyken kendi başına yerel bildirim planlamasına izin vermez. Kese'de sistem bildirimi, uygulama açıldığında veya ön plana geldiğinde kontrol edilir. Uygulama kapalıyken kesin hatırlatma için **Takvime hatırlatma ekle** özelliğini kullan. Gerçek arka plan bildirimi ileride bir push sunucusuyla eklenebilir.

## Yedekleme

Ayarlar → **Yedek al** ile tüm kayıtları JSON olarak kaydet. iPhone'da paylaş menüsü açılır; **Dosyalar'a Kaydet** diyerek yeri kendin seçebilirsin. Paylaş menüsü çıkmazsa dosya **Dosyalar → İndirilenler** klasörüne gider. Safari verilerini temizlersen kayıtlar silinebilir; ara ara yedek al. **Yedekten yükle** ile geri yükle.

## Dosyalar

- `index.html` — uygulama kabuğu
- `app.js` — tüm uygulama mantığı
- `styles.css` — arayüz
- `sw.js` — çevrimdışı service worker ve bildirim tıklama
- `manifest.webmanifest` — PWA tanımı
- `icons/` — uygulama simgeleri ve açılış ekranları
- `tools/make-icons.py` — simgeleri yeniden üretme aracı
