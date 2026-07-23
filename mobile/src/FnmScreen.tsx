import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { companies, sponsors, sponsorIds } from '@devedesiatky/content'
import type { CompanyId, FnmDestination, GameState, SponsorId } from '@devedesiatky/simulation'

function formatSk(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

export function FnmScreen({
  state,
  onAssign,
  onFinish,
}: {
  state: GameState
  onAssign: (companyId: CompanyId, destination: FnmDestination) => void
  onFinish: () => void
}) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Fond národného majetku">
      <Text style={styles.eyebrow}>Fond národného majetku</Text>
      <Text style={styles.title}>Rozdávaj</Text>
      <Text style={styles.lede}>
        Štyri cesty: sponzor (cash + kauza), partner (koalícia), súťaž (reputácia), alebo odklad.
      </Text>
      <Text style={styles.koalicia}>
        Koalícia: <Text style={styles.koaliciaValue}>{state.koalicia.toFixed(0)}</Text>
      </Text>

      <Text style={styles.section}>Sponzori</Text>
      {sponsorIds.map((id) => {
        const sponsor = sponsors[id]
        return (
          <View key={id} style={styles.sponsor}>
            <Text style={styles.sponsorName}>{sponsor.nameSk}</Text>
            <Text style={styles.sponsorMeta}>
              Štedrosť {(sponsor.generosity * 100).toFixed(0)}% · riziko {sponsor.riskiness.toFixed(1)}
            </Text>
          </View>
        )
      })}

      <Text style={styles.section}>Podniky na privatizáciu</Text>
      {state.fnmOffered.map((companyId) => {
        const company = companies[companyId]
        return (
          <View key={companyId} style={styles.company}>
            <Text style={styles.companyName}>{company.nameSk}</Text>
            <Text style={styles.companyMeta}>
              {company.regionSk} · knižná hodnota {formatSk(company.bookValue)}
            </Text>
            <View style={styles.assign}>
              {(Object.keys(sponsors) as SponsorId[]).map((sponsorId) => (
                <Pressable
                  key={sponsorId}
                  accessibilityRole="button"
                  style={styles.assignBtn}
                  onPress={() => onAssign(companyId, { kind: 'sponsor', sponsorId })}
                >
                  <Text style={styles.assignLabel}>Sponzor: {sponsors[sponsorId].nameSk}</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                style={styles.assignBtn}
                onPress={() => onAssign(companyId, { kind: 'partner' })}
              >
                <Text style={styles.assignLabel}>Koaličný partner</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={styles.assignBtn}
                onPress={() => onAssign(companyId, { kind: 'auction' })}
              >
                <Text style={styles.assignLabel}>Verejná súťaž</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={[styles.assignBtn, styles.assignDanger]}
                onPress={() => onAssign(companyId, { kind: 'cancel' })}
              >
                <Text style={styles.assignLabel}>Zrušiť / odložiť</Text>
              </Pressable>
            </View>
          </View>
        )
      })}

      {state.fnmOffered.length === 0 ? (
        <Text style={styles.empty}>Všetky podniky rozdané.</Text>
      ) : null}

      <Pressable accessibilityRole="button" style={styles.cta} onPress={onFinish}>
        <Text style={styles.ctaLabel}>Hotovo, späť</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
    paddingBottom: 32,
  },
  eyebrow: {
    color: '#c4a484',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#f4e6c8',
    fontSize: 26,
    fontWeight: '800',
  },
  lede: {
    color: '#9a8a7a',
    fontSize: 14,
    lineHeight: 20,
  },
  koalicia: {
    color: '#c4a484',
    fontSize: 14,
    marginBottom: 4,
  },
  koaliciaValue: {
    color: '#f0f0f0',
    fontWeight: '800',
  },
  section: {
    marginTop: 8,
    color: '#c4a484',
    fontSize: 13,
    fontWeight: '700',
  },
  sponsor: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 10,
    gap: 2,
  },
  sponsorName: {
    color: '#f0f0f0',
    fontWeight: '700',
  },
  sponsorMeta: {
    color: '#9a8a7a',
    fontSize: 12,
  },
  company: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 12,
    gap: 8,
    backgroundColor: '#1f1216',
  },
  companyName: {
    color: '#f4e6c8',
    fontSize: 16,
    fontWeight: '700',
  },
  companyMeta: {
    color: '#9a8a7a',
    fontSize: 13,
  },
  assign: {
    gap: 6,
  },
  assignBtn: {
    backgroundColor: '#2a1814',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assignDanger: {
    borderWidth: 1,
    borderColor: '#6a3030',
  },
  assignLabel: {
    color: '#e8e2d6',
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: '#9a8a7a',
    fontSize: 14,
  },
  cta: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#c45c26',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 16,
    fontWeight: '700',
  },
})
