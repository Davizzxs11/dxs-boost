# Componentes de terceiros

Os componentes abaixo são distribuídos sem modificações. As licenças aplicáveis permanecem com seus respectivos autores. O código-fonte do DXS e seu script de compilação acompanham este pacote; as bibliotecas podem ser substituídas e o programa recompilado.

| Componente | Versão | Licença e fonte |
|---|---|---|
| Intel PresentMon | 2.5.1 x64 | MIT, `licenses/PresentMon-LICENSE.txt`; [fonte da versão](https://github.com/GameTechDev/PresentMon/tree/v2.5.1). |
| LibreHardwareMonitorLib | 0.9.6 | MPL 2.0, `licenses/LHM-LICENSE.txt`; [fonte da versão](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/tree/v0.9.6). Avisos de recursos incorporados em `licenses/LHM-THIRD-PARTY-NOTICES.txt`. |
| DiskInfoToolkit | 1.1.2 | MPL 2.0, texto em `licenses/LHM-LICENSE.txt`; Copyright Florian K.; [fonte correspondente](https://github.com/Blacktempel/DiskInfoToolkit/tree/25319eae5781e75bcf141e844ceab2afe94d40ea). |
| RAMSPDToolkit-NDD | 1.4.2 | MPL 2.0, texto em `licenses/LHM-LICENSE.txt`; Copyright Florian K.; [fonte correspondente](https://github.com/Blacktempel/RAMSPDToolkit/tree/3b47b960e0830fef344624ad5e389675d5f0a1ce). |
| BlackSharp.Core | 1.0.7 | MPL 2.0, texto em `licenses/LHM-LICENSE.txt`; Copyright Florian K.; [fonte correspondente](https://github.com/Blacktempel/BlackSharp/tree/c70b735c6cec123ee8a046ac4a0bc6c606f52cf0). |
| HidSharp | 2.6.4 | Apache 2.0, `licenses/HidSharp-LICENSE.txt`; Copyright 2010–2025 James Bellinger; [projeto](https://software.seekye.com/hidsharp), [pacote oficial](https://www.nuget.org/packages/HidSharp/2.6.4). |
| System.Memory, System.Buffers, System.Numerics.Vectors, System.Runtime.CompilerServices.Unsafe | Binários da distribuição LibreHardwareMonitor 0.9.6 | MIT, `licenses/Microsoft-NET-LICENSE.txt`; [fontes .NET](https://github.com/dotnet/runtime). |

Os binários de sensores foram obtidos do [pacote oficial LibreHardwareMonitor 0.9.6](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases/tag/v0.9.6). O monitor de GPU não habilita as rotinas de CPU, placa-mãe, memória, armazenamento ou controle de ventoinhas da biblioteca. Nenhum instalador de driver é incluído ou executado pelo DXS.

Os hashes SHA-256 dos binários distribuídos estão em `SHA256.txt`.

## Componentes do .NET Framework usados nesta versão

Além de WPF, o DXS Boost referencia `System.Management` (consulta WMI dos módulos de memória, na aba Diagnóstico) e `System.Windows.Forms` com `System.Drawing` (ícone na bandeja do sistema). Ambos acompanham o .NET Framework 4.8 instalado no Windows e estão cobertos pela licença da Microsoft já incluída em `licenses/Microsoft-NET-LICENSE.txt`. Nenhuma biblioteca nova foi adicionada à pasta `lib/`.
