import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  campaignChannels,
  campaignRegions,
  coalitionPosts,
  institutions,
  npcArchetypes,
  type CampaignChannel,
  type CampaignRegion,
  type CoalitionPost,
  type InstitutionAssignee,
  type InstitutionId,
} from '@devedesiatky/content'
import type { GameState, NpcArchetypeId } from '@devedesiatky/simulation'

const regionLabelsSk: Record<CampaignRegion, string> = {
  zapad: 'Západ',
  stred: 'Stred',
  vychod: 'Východ',
}

function formatSk(amount: number): string {
  return `${Math.round(amount).toLocaleString('sk-SK')} Sk`
}

function ChipRow<T extends string>({
  options,
  value,
  labels,
  onChange,
}: {
  options: readonly T[]
  value: T
  labels: Record<T, string>
  onChange: (value: T) => void
}) {
  return (
    <View style={styles.chips}>
      {options.map((id) => (
        <Pressable
          key={id}
          accessibilityRole="button"
          style={[styles.chip, value === id && styles.chipOn]}
          onPress={() => onChange(id)}
        >
          <Text style={[styles.chipLabel, value === id && styles.chipLabelOn]}>{labels[id]}</Text>
        </Pressable>
      ))}
    </View>
  )
}

export function VolbyKampan({
  state,
  onSpend,
  onFinish,
}: {
  state: GameState
  onSpend: (input: {
    region: CampaignRegion
    channel: CampaignChannel
    amount: number
  }) => void
  onFinish: () => void
}) {
  const election = state.election
  const [region, setRegion] = useState<CampaignRegion>('vychod')
  const [channel, setChannel] = useState<CampaignChannel>('rallies')
  const [amount, setAmount] = useState(20_000)
  if (!election) return null

  const channelLabels = Object.fromEntries(
    (Object.keys(campaignChannels) as CampaignChannel[]).map((id) => [
      id,
      campaignChannels[id].labelSk,
    ]),
  ) as Record<CampaignChannel, string>

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Volebná kampaň">
      <Text style={styles.eyebrow}>Voľby ’94 · kampaň</Text>
      <Text style={styles.title}>
        Kolo {election.campaignRound}/{election.maxRounds}
      </Text>
      <Text style={styles.lede}>
        Pokladňa {formatSk(state.pokladna)} · preferencie +{election.totalBoost.toFixed(1)}
      </Text>

      <Text style={styles.section}>Región</Text>
      <ChipRow
        options={campaignRegions}
        value={region}
        labels={regionLabelsSk}
        onChange={setRegion}
      />

      <Text style={styles.section}>Kanál</Text>
      <ChipRow
        options={Object.keys(campaignChannels) as CampaignChannel[]}
        value={channel}
        labels={channelLabels}
        onChange={setChannel}
      />

      <Text style={styles.section}>Výdavok</Text>
      <View style={styles.chips}>
        {[10_000, 20_000, 40_000, 60_000].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            style={[styles.chip, amount === n && styles.chipOn]}
            onPress={() => setAmount(n)}
          >
            <Text style={[styles.chipLabel, amount === n && styles.chipLabelOn]}>
              {formatSk(n)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.boosts}>
        {campaignRegions.map((id) => (
          <Text key={id} style={styles.boost}>
            {regionLabelsSk[id]}: +{election.boostByRegion[id].toFixed(1)}
          </Text>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        style={[styles.cta, (amount <= 0 || state.pokladna < amount) && styles.ctaDisabled]}
        disabled={amount <= 0 || state.pokladna < amount}
        onPress={() => onSpend({ region, channel, amount })}
      >
        <Text style={styles.ctaLabel}>Minúť na kampaň</Text>
      </Pressable>
      <Pressable accessibilityRole="button" style={styles.link} onPress={onFinish}>
        <Text style={styles.linkLabel}>
          {election.campaignRound < election.maxRounds ? 'Ďalšie kolo' : 'Na volebnú noc'}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

export function VolbyNoc({
  state,
  onResolve,
  onContinue,
}: {
  state: GameState
  onResolve: () => void
  onContinue: () => void
}) {
  const election = state.election
  if (!election) return null
  const exit = election.exitPoll
  const final = election.finalShare
  const needle = final ?? state.preferencie + election.totalBoost
  const widthPct = Math.min(100, Math.max(0, needle) * 2.2)

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Volebná noc">
      <Text style={styles.eyebrow}>Voľby ’94 · volebná noc</Text>
      <Text style={styles.title}>Volebná ihla</Text>
      <Text style={styles.lede}>Predbežný prieskum oproti sčítaniu.</Text>

      <View
        style={styles.needle}
        accessibilityLabel={`Preferencie ${needle.toFixed(1)} percent`}
      >
        <View style={styles.needleTrack}>
          <View style={[styles.needleFill, { width: `${widthPct}%` }]} />
        </View>
        <Text style={styles.ticker}>
          {exit == null
            ? `Predbežne ${needle.toFixed(1)} %`
            : `Prieskum ${exit.toFixed(1)} % · výsledok ${final?.toFixed(1)} % · ${election.won ? 'víťazstvo' : 'prehra'}`}
        </Text>
      </View>

      {exit == null ? (
        <Pressable accessibilityRole="button" style={styles.cta} onPress={onResolve}>
          <Text style={styles.ctaLabel}>Spustiť sčítanie</Text>
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" style={styles.cta} onPress={onContinue}>
          <Text style={styles.ctaLabel}>
            {election.won ? 'Skladať vládu' : 'Ísť do opozície'}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  )
}

export function VolbyKoalicia({
  state,
  onOffer,
  onFinish,
  onSkip,
}: {
  state: GameState
  onOffer: (input: { partnerId: NpcArchetypeId; posts: CoalitionPost[] }) => void
  onFinish: () => void
  onSkip: () => void
}) {
  const election = state.election
  const [partnerId, setPartnerId] = useState<NpcArchetypeId | null>(null)
  const [posts, setPosts] = useState<CoalitionPost[]>(['culture'])
  if (!election) return null

  function togglePost(post: CoalitionPost) {
    setPosts((prev) => (prev.includes(post) ? prev.filter((p) => p !== post) : [...prev, post]))
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Koalícia">
      <Text style={styles.eyebrow}>Voľby ’94 · skladanie vlády</Text>
      <Text style={styles.title}>Ponuka partnerovi</Text>
      <Text style={styles.lede}>Vnútro je drahé: tlmí kauzy, partner si ho cení.</Text>

      <Text style={styles.section}>Partner</Text>
      <View style={styles.chips}>
        {state.npcParties.map((npc) => (
          <Pressable
            key={npc.id}
            accessibilityRole="button"
            style={[styles.chip, partnerId === npc.id && styles.chipOn]}
            onPress={() => setPartnerId(npc.id)}
          >
            <Text style={[styles.chipLabel, partnerId === npc.id && styles.chipLabelOn]}>
              {npcArchetypes[npc.id].labelSk}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>Rezorty</Text>
      {(Object.keys(coalitionPosts) as CoalitionPost[]).map((post) => (
        <Pressable
          key={post}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: posts.includes(post) }}
          style={[styles.check, posts.includes(post) && styles.checkOn]}
          onPress={() => togglePost(post)}
        >
          <Text style={styles.checkLabel}>
            {coalitionPosts[post].labelSk}
            {post === 'interior' ? ' (drahé)' : ''}
          </Text>
        </Pressable>
      ))}

      {election.coalitionPartnerId ? (
        <Text style={styles.ok}>
          Partner {npcArchetypes[election.coalitionPartnerId].labelSk} prijal ponuku. Koalícia{' '}
          {state.koalicia.toFixed(0)}.
        </Text>
      ) : election.offeredPosts.length > 0 ? (
        <Text style={styles.warn}>Partner odmietol. Posilni ponuku (skús Vnútro / FNM).</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.cta, (!partnerId || posts.length === 0) && styles.ctaDisabled]}
        disabled={!partnerId || posts.length === 0}
        onPress={() => partnerId && onOffer({ partnerId, posts })}
      >
        <Text style={styles.ctaLabel}>Ponúknuť</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={[styles.link, !election.coalitionPartnerId && styles.ctaDisabled]}
        disabled={!election.coalitionPartnerId}
        onPress={onFinish}
      >
        <Text style={styles.linkLabel}>Noc dlhých nožov</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={[styles.link, !election.coalitionPartnerId && styles.ctaDisabled]}
        disabled={!election.coalitionPartnerId}
        onPress={onSkip}
      >
        <Text style={styles.linkLabel}>Preskočiť noc</Text>
      </Pressable>
    </ScrollView>
  )
}

export function VolbyNocNozo({
  state,
  onAssign,
  onFinish,
}: {
  state: GameState
  onAssign: (input: {
    institutionId: InstitutionId
    assigneeId: InstitutionAssignee
  }) => void
  onFinish: () => void
}) {
  const election = state.election
  if (!election || !election.coalitionPartnerId) return null
  const partnerId = election.coalitionPartnerId
  const partnerLabel = npcArchetypes[partnerId].labelSk

  return (
    <ScrollView contentContainerStyle={styles.scroll} accessibilityLabel="Noc dlhých nožov">
      <Text style={styles.eyebrow}>Noc dlhých nožov</Text>
      <Text style={styles.title}>Rozdel inštitúcie</Text>
      <Text style={styles.lede}>Priraď karty sebe alebo partnerovi ({partnerLabel}).</Text>

      {(Object.keys(institutions) as InstitutionId[]).map((id) => (
        <View key={id} style={styles.institution}>
          <Text style={styles.institutionName}>{institutions[id].labelSk}</Text>
          <View style={styles.chips}>
            <Pressable
              accessibilityRole="button"
              style={[styles.chip, election.institutions[id] === 'player' && styles.chipOn]}
              onPress={() => onAssign({ institutionId: id, assigneeId: 'player' })}
            >
              <Text
                style={[
                  styles.chipLabel,
                  election.institutions[id] === 'player' && styles.chipLabelOn,
                ]}
              >
                Ty
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={[styles.chip, election.institutions[id] === partnerId && styles.chipOn]}
              onPress={() => onAssign({ institutionId: id, assigneeId: partnerId })}
            >
              <Text
                style={[
                  styles.chipLabel,
                  election.institutions[id] === partnerId && styles.chipLabelOn,
                ]}
              >
                {partnerLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable accessibilityRole="button" style={styles.cta} onPress={onFinish}>
        <Text style={styles.ctaLabel}>Uzavrieť noc</Text>
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
    fontSize: 24,
    fontWeight: '800',
  },
  lede: {
    color: '#9a8a7a',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginTop: 6,
    color: '#c4a484',
    fontSize: 13,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f1216',
  },
  chipOn: {
    borderColor: '#c45c26',
    backgroundColor: '#2a1814',
  },
  chipLabel: {
    color: '#9a8a7a',
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelOn: {
    color: '#f4e6c8',
  },
  boosts: {
    gap: 4,
  },
  boost: {
    color: '#e8e2d6',
    fontSize: 13,
  },
  needle: {
    gap: 8,
    marginVertical: 8,
  },
  needleTrack: {
    height: 12,
    backgroundColor: '#3a2a28',
    borderRadius: 6,
    overflow: 'hidden',
  },
  needleFill: {
    height: '100%',
    backgroundColor: '#c45c26',
  },
  ticker: {
    color: '#f0f0f0',
    fontSize: 14,
    fontWeight: '600',
  },
  check: {
    borderWidth: 1,
    borderColor: '#3a2a28',
    padding: 12,
  },
  checkOn: {
    borderColor: '#c45c26',
    backgroundColor: '#2a1814',
  },
  checkLabel: {
    color: '#e8e2d6',
    fontSize: 14,
  },
  ok: {
    color: '#b8d4a8',
    fontSize: 14,
  },
  warn: {
    color: '#e0a060',
    fontSize: 14,
  },
  institution: {
    gap: 8,
    marginBottom: 4,
  },
  institutionName: {
    color: '#f0f0f0',
    fontWeight: '700',
    fontSize: 15,
  },
  cta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#c45c26',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaLabel: {
    color: '#fff8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  link: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  linkLabel: {
    color: '#c4a484',
    fontSize: 14,
    fontWeight: '600',
  },
})
